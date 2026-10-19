import {
  ADMIN_UI,
  APPLE_MUSIC_CONFIG,
  BROWSER_API,
  DATABASE_CONFIG,
  ERROR_MESSAGES,
  LOG_MESSAGES,
  MUSIC_AGGREGATE_SERVICE,
  SPOTIFY_CONFIG,
  YOUTUBE_MUSIC_CONFIG,
  musicApiUrl,
} from "@/lib/constants";
import type {
  MusicServiceId,
  NowPlayingPayload,
  PublicNowPlayingListener,
  PublicNowPlayingSnapshot,
  SharedLastPlayedServiceId,
} from "@/lib/interfaces";

type ClientServiceKey = MusicServiceId | typeof MUSIC_AGGREGATE_SERVICE;

type ServiceClientConfig = {
  service: ClientServiceKey;
  credentials: RequestCredentials;
  activePollMs: number;
  idlePollMs: number;
  apiError: string;
  logLabel: string;
};

type ServiceRuntime = {
  payload: NowPlayingPayload | null;
  loading: boolean;
  error: string | null;
  source: SharedLastPlayedServiceId | null;
  isPlaying: boolean;
  inFlight: Promise<void> | null;
  pollTimer: ReturnType<typeof setTimeout> | null;
  subscriberCount: number;
  listeners: Set<PublicNowPlayingListener>;
  visibilityBound: boolean;
};

const SERVICE_CONFIGS: Record<ClientServiceKey, ServiceClientConfig> = {
  [DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY]: {
    service: DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY,
    credentials: SPOTIFY_CONFIG.FETCH_CREDENTIALS,
    activePollMs: SPOTIFY_CONFIG.POLLING_INTERVALS.ACTIVE,
    idlePollMs: SPOTIFY_CONFIG.POLLING_INTERVALS.IDLE,
    apiError: ERROR_MESSAGES.SPOTIFY.API_ERROR,
    logLabel: ADMIN_UI.SPOTIFY.HEADING,
  },
  [DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC]: {
    service: DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC,
    credentials: YOUTUBE_MUSIC_CONFIG.FETCH_CREDENTIALS,
    // No YTM now-playing detection; runtime slot kept for MusicServiceId typing only.
    activePollMs: YOUTUBE_MUSIC_CONFIG.POLLING_INTERVALS.ACTIVE,
    idlePollMs: YOUTUBE_MUSIC_CONFIG.POLLING_INTERVALS.IDLE,
    apiError: ERROR_MESSAGES.YOUTUBE_MUSIC.API_ERROR,
    logLabel: ADMIN_UI.YOUTUBE_MUSIC.HEADING,
  },
  [DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC]: {
    service: DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC,
    credentials: APPLE_MUSIC_CONFIG.FETCH_CREDENTIALS,
    activePollMs: APPLE_MUSIC_CONFIG.POLLING_INTERVALS.ACTIVE,
    idlePollMs: APPLE_MUSIC_CONFIG.POLLING_INTERVALS.IDLE,
    apiError: ERROR_MESSAGES.APPLE_MUSIC.API_ERROR,
    logLabel: ADMIN_UI.APPLE_MUSIC.HEADING,
  },
  [MUSIC_AGGREGATE_SERVICE]: {
    service: MUSIC_AGGREGATE_SERVICE,
    credentials: SPOTIFY_CONFIG.FETCH_CREDENTIALS,
    activePollMs: SPOTIFY_CONFIG.POLLING_INTERVALS.ACTIVE,
    idlePollMs: SPOTIFY_CONFIG.POLLING_INTERVALS.IDLE,
    apiError: ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR,
    logLabel: LOG_MESSAGES.PUBLIC_CLIENT.PRIORITY_LABEL,
  },
};

function createRuntime(): ServiceRuntime {
  return {
    payload: null,
    loading: true,
    error: null,
    source: null,
    isPlaying: false,
    inFlight: null,
    pollTimer: null,
    subscriberCount: 0,
    listeners: new Set(),
    visibilityBound: false,
  };
}

const runtimes: Record<ClientServiceKey, ServiceRuntime> = {
  [DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY]: createRuntime(),
  [DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC]: createRuntime(),
  [DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC]: createRuntime(),
  [MUSIC_AGGREGATE_SERVICE]: createRuntime(),
};

function snapshot(runtime: ServiceRuntime): PublicNowPlayingSnapshot {
  return {
    payload: runtime.payload,
    loading: runtime.loading,
    error: runtime.error,
    source: runtime.source,
  };
}

function emit(runtime: ServiceRuntime) {
  const next = snapshot(runtime);
  runtime.listeners.forEach((listener) => {
    listener(next);
  });
}

function stopPolling(runtime: ServiceRuntime) {
  if (runtime.pollTimer) {
    clearTimeout(runtime.pollTimer);
    runtime.pollTimer = null;
  }
}

function isSharedLastPlayedServiceId(value: unknown): value is SharedLastPlayedServiceId {
  return (
    value === DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY ||
    value === DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC ||
    value === DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC
  );
}

async function fetchPublicNowPlaying(config: ServiceClientConfig, runtime: ServiceRuntime): Promise<void> {
  if (runtime.inFlight) {
    return runtime.inFlight;
  }

  runtime.inFlight = (async () => {
    try {
      runtime.error = null;
      const response = await fetch(musicApiUrl("PUBLIC_NOW_PLAYING", config.service), {
        credentials: config.credentials,
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(config.apiError);
      }
      const data = await response.json();

      if (response.ok && data.success && data.data) {
        const playedAt =
          typeof data.data.playedAt === "string"
            ? data.data.playedAt
            : typeof data.data.timestamp === "string"
              ? data.data.timestamp
              : undefined;
        runtime.payload = {
          isPlaying: Boolean(data.data.isPlaying),
          isLastPlayed: Boolean(data.data.isLastPlayed),
          track: data.data.track ?? null,
          playedAt,
        };
        runtime.source = isSharedLastPlayedServiceId(data.data.source) ? data.data.source : null;
        runtime.isPlaying = runtime.payload.isPlaying;
      } else {
        runtime.isPlaying = false;
        runtime.source = null;
        runtime.payload = { isPlaying: false, isLastPlayed: false, track: null };
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === BROWSER_API.ABORT_ERROR_NAME) {
        return;
      }
      console.error(LOG_MESSAGES.PUBLIC_CLIENT.fetchError(config.logLabel), err);
      runtime.isPlaying = false;
      runtime.source = null;
      runtime.payload = { isPlaying: false, isLastPlayed: false, track: null };
      runtime.error = config.apiError;
    } finally {
      runtime.loading = false;
      runtime.inFlight = null;
      emit(runtime);
    }
  })();

  return runtime.inFlight;
}

function scheduleNextPoll(config: ServiceClientConfig, runtime: ServiceRuntime) {
  stopPolling(runtime);
  if (runtime.subscriberCount === 0) {
    return;
  }
  if (typeof document !== "undefined" && document.visibilityState !== BROWSER_API.VISIBILITY_VISIBLE) {
    return;
  }

  const interval = runtime.isPlaying ? config.activePollMs : config.idlePollMs;
  runtime.pollTimer = setTimeout(() => {
    void fetchPublicNowPlaying(config, runtime).finally(() => {
      scheduleNextPoll(config, runtime);
    });
  }, interval);
}

function startPolling(config: ServiceClientConfig, runtime: ServiceRuntime) {
  if (runtime.subscriberCount === 0) {
    return;
  }
  stopPolling(runtime);
  void fetchPublicNowPlaying(config, runtime).finally(() => {
    scheduleNextPoll(config, runtime);
  });
}

function ensureVisibilityListener(config: ServiceClientConfig, runtime: ServiceRuntime) {
  if (runtime.visibilityBound || typeof document === "undefined") {
    return;
  }
  const onVisibility = () => {
    if (document.visibilityState === BROWSER_API.VISIBILITY_VISIBLE) {
      startPolling(config, runtime);
    } else {
      stopPolling(runtime);
    }
  };
  document.addEventListener(BROWSER_API.VISIBILITY_CHANGE, onVisibility);
  runtime.visibilityBound = true;
}

function subscribe(service: ClientServiceKey, listener: PublicNowPlayingListener): () => void {
  const config = SERVICE_CONFIGS[service];
  const runtime = runtimes[service];
  runtime.listeners.add(listener);
  runtime.subscriberCount += 1;
  listener(snapshot(runtime));
  ensureVisibilityListener(config, runtime);

  if (runtime.subscriberCount === 1) {
    startPolling(config, runtime);
  }

  return () => {
    runtime.listeners.delete(listener);
    runtime.subscriberCount = Math.max(0, runtime.subscriberCount - 1);
    if (runtime.subscriberCount === 0) {
      stopPolling(runtime);
    }
  };
}

/**
 * Subscribe to shared public now-playing state for one music service.
 * First subscriber starts fetch/poll; last subscriber stops polling only
 * (never aborts an in-flight request).
 */
export function subscribePublicMusicNowPlaying(
  service: MusicServiceId,
  listener: PublicNowPlayingListener,
): () => void {
  return subscribe(service, listener);
}

/** Spotify-first aggregate used by About NowPlaying */
export function subscribePriorityMusicNowPlaying(listener: PublicNowPlayingListener): () => void {
  return subscribe(MUSIC_AGGREGATE_SERVICE, listener);
}

export function refetchPublicMusicNowPlaying(service: MusicServiceId): Promise<void> {
  return fetchPublicNowPlaying(SERVICE_CONFIGS[service], runtimes[service]);
}

export function refetchPriorityMusicNowPlaying(): Promise<void> {
  return fetchPublicNowPlaying(SERVICE_CONFIGS[MUSIC_AGGREGATE_SERVICE], runtimes[MUSIC_AGGREGATE_SERVICE]);
}
