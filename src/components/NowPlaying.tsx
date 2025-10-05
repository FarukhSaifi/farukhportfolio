"use client";

import { useSpotify } from "@/contexts/SpotifyContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface SimplifiedTrack {
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  songUrl: string;
}

interface NowPlayingPayload {
  isPlaying: boolean;
  track: SimplifiedTrack | null;
}

type FetchResult = {
  ok: boolean;
  status: number;
  data?: NowPlayingPayload;
  newAccessToken?: { token: string; expiresIn: number };
  etag?: string | null;
};

const POLL_OK_INTERVAL = 30000;
const POLL_IDLE_INTERVAL = 45000;
const ERROR_BACKOFF_BASE = 2000;
const ERROR_BACKOFF_MAX = 30000;

function useNowPlaying() {
  const { hasRefreshToken, getTokenForAPI, updateAccessToken } = useSpotify();
  const [payload, setPayload] = useState<NowPlayingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const pollTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const backoffRef = useRef<number>(0);
  const inFlightRef = useRef<boolean>(false);
  const initializedRef = useRef<boolean>(false);
  const lastTrackIdRef = useRef<string | null>(null);
  const etagRef = useRef<string | null>(null);
  const reqSeqRef = useRef<number>(0);

  const clearTimeoutOnly = () => {
    if (pollTimerRef.current) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const abortInFlight = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      inFlightRef.current = false;
    }
  };

  const scheduleNext = (ms: number) => {
    clearTimeoutOnly();
    pollTimerRef.current = window.setTimeout(() => void fetchNowPlaying(), ms);
  };

  const callApi = async (preferBearer: boolean): Promise<FetchResult> => {
    const controller = new AbortController();
    abortRef.current = controller;

    const token = getTokenForAPI() || "";
    const headers: Record<string, string> = {};

    if (preferBearer) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      headers["x-spotify-token"] = token;
      headers["x-token-type"] = "refresh";
    }

    if (etagRef.current) headers["If-None-Match"] = etagRef.current;

    const res = await fetch("/api/spotify/now-playing", {
      headers,
      signal: controller.signal,
    });

    const newAccessToken = res.headers.get("x-new-access-token");
    const expiresIn = res.headers.get("x-access-token-expires-in");
    const etag = res.headers.get("ETag");

    let data: NowPlayingPayload | undefined;
    try {
      data = res.status === 200 ? ((await res.json()) as NowPlayingPayload) : undefined;
    } catch {
      data = undefined;
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
      etag,
      newAccessToken:
        newAccessToken && expiresIn ? { token: newAccessToken, expiresIn: parseInt(expiresIn) || 3600 } : undefined,
    };
  };

  const fetchNowPlaying = useCallback(async () => {
    if (inFlightRef.current) return;

    const seq = ++reqSeqRef.current;

    try {
      if (!hasRefreshToken()) {
        setError("Not authenticated with Spotify");
        setPayload(null);
        scheduleNext(POLL_IDLE_INTERVAL);
        return;
      }

      inFlightRef.current = true;
      setLoading(true);
      setError(null);

      let result = await callApi(true);
      if (!result.ok && (result.status === 401 || result.status === 400)) {
        result = await callApi(false);
      }

      if (seq !== reqSeqRef.current) return;

      if (result.newAccessToken) {
        updateAccessToken(result.newAccessToken.token, result.newAccessToken.expiresIn);
      }

      if (result.status === 304) {
        backoffRef.current = 0;
        scheduleNext(POLL_OK_INTERVAL);
        return;
      }

      if (result.ok && result.data) {
        etagRef.current = result.etag || null;

        // Use title + artist + album as identity (API does not return Spotify id in simplified payload)
        const identity = result.data.track
          ? `${result.data.track.title}|${result.data.track.artist}|${result.data.track.album}`
          : null;
        const prevIdentity = lastTrackIdRef.current;
        lastTrackIdRef.current = identity;

        if (identity !== prevIdentity || !payload) {
          setPayload(result.data);
        }

        backoffRef.current = 0;
        scheduleNext(POLL_OK_INTERVAL);
        return;
      }

      if (result.status === 204) {
        etagRef.current = null;
        lastTrackIdRef.current = null;
        if (!payload || payload.isPlaying) setPayload({ isPlaying: false, track: null });
        backoffRef.current = 0;
        scheduleNext(POLL_IDLE_INTERVAL);
        return;
      }

      const nextDelay = Math.min(ERROR_BACKOFF_MAX, ERROR_BACKOFF_BASE * Math.pow(2, backoffRef.current));
      backoffRef.current = Math.min(backoffRef.current + 1, 4);
      setError(`Spotify API error (${result.status})`);
      scheduleNext(nextDelay || 5000);
    } catch (e: any) {
      const nextDelay = Math.min(ERROR_BACKOFF_MAX, ERROR_BACKOFF_BASE * Math.pow(2, backoffRef.current));
      backoffRef.current = Math.min(backoffRef.current + 1, 4);
      setError(e?.message || "Network error");
      scheduleNext(nextDelay || 5000);
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [getTokenForAPI, hasRefreshToken, payload, updateAccessToken]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchNowPlaying();
      } else {
        clearTimeoutOnly();
        abortInFlight();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    fetchNowPlaying();
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimeoutOnly();
      abortInFlight();
    };
  }, [fetchNowPlaying]);

  const value = useMemo(() => ({ payload, loading, error }), [payload, loading, error]);

  return value;
}

export default function NowPlaying() {
  const { payload, loading, error } = useNowPlaying();

  if (loading) {
    return <span className="text-sm text-gray-500">Loading Spotify…</span>;
  }

  if (error) {
    return (
      <button
        onClick={() => (window.location.href = "/spotify-auth")}
        className="text-sm text-blue-500 hover:underline"
        title={error}
      >
        Connect Spotify
      </button>
    );
  }

  if (!payload || !payload.isPlaying || !payload.track) {
    return <span className="text-sm text-gray-500">Not playing</span>;
  }

  const track = payload.track;

  return (
    <a
      href={track.songUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-md border border-[var(--neutral-alpha-weak)] bg-[rgb(16,16,16,0.5)] px-3 py-2 shadow-sm hover:bg-[rgb(24,24,24,0.65)] transition-colors"
      title={`${track.title} — ${track.artist}`}
    >
      {/* Using img to avoid remote domain restrictions */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={track.imageUrl}
        alt={`${track.album} cover`}
        width={40}
        height={40}
        className="h-10 w-10 rounded object-cover"
        loading="lazy"
        decoding="async"
      />
      <div className="min-w-0 flex-1 leading-tight">
        <div className="text-[11px] uppercase tracking-wide text-[var(--accent-weak)]">Now Playing</div>
        <div className="truncate text-sm text-white group-hover:underline">{track.title}</div>
        <div className="truncate text-xs text-[var(--neutral-weak)]">
          {track.artist} · {track.album}
        </div>
      </div>
    </a>
  );
}
