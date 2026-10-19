import { DATABASE_CONFIG, ERROR_MESSAGES, HTTP_STATUS, LOG_MESSAGES, SPOTIFY_CONFIG } from "@/lib/constants";
import { databaseService } from "@/lib/database";
import type {
  CurrentlyPlayingResult,
  NowPlayingPayload,
  PublicNowPlayingPayload,
  SimplifiedTrack,
} from "@/lib/interfaces";
import { SpotifyUtils } from "@/lib/server-utils";

function toSimplifiedTrack(doc: {
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  songUrl: string;
}): SimplifiedTrack {
  return {
    title: doc.title,
    artist: doc.artist,
    album: doc.album,
    imageUrl: doc.imageUrl,
    songUrl: doc.songUrl,
  };
}

function emptyPayload(): NowPlayingPayload {
  return { isPlaying: false, isLastPlayed: false, track: null };
}

function isSpotifyAccessRestricted(status: number, body: string): boolean {
  if (status !== HTTP_STATUS.FORBIDDEN) {
    return false;
  }
  // Spotify returns 403 for Premium-only player features and some restricted accounts
  return LOG_MESSAGES.SPOTIFY.ACCESS_RESTRICTED_PATTERN.test(body);
}

async function requestCurrentlyPlaying(accessToken: string): Promise<Response> {
  const url = new URL(`${SPOTIFY_CONFIG.API_BASE_URL}${SPOTIFY_CONFIG.CURRENTLY_PLAYING_PATH}`);
  url.searchParams.set("additional_types", SPOTIFY_CONFIG.CURRENTLY_PLAYING_ADDITIONAL_TYPES);

  return fetch(url.toString(), {
    headers: {
      [SPOTIFY_CONFIG.HEADERS.AUTHORIZATION]: `${SPOTIFY_CONFIG.DEFAULT_TOKEN_TYPE} ${accessToken}`,
      [SPOTIFY_CONFIG.HEADERS.CONTENT_TYPE]: SPOTIFY_CONFIG.HEADERS.JSON,
    },
  });
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const refreshResult = await SpotifyUtils.refreshSpotifyToken(refreshToken);
  if (!refreshResult) {
    return null;
  }

  const updateResult = await databaseService.updateSpotifyToken({
    access_token: refreshResult.access_token,
    expires_in: refreshResult.expires_in,
    token_type: refreshResult.token_type,
  });

  if (!updateResult.success) {
    console.error(LOG_MESSAGES.SPOTIFY.PERSIST_REFRESH_FAILED, updateResult.error);
  }

  return refreshResult.access_token;
}

async function parseSpotifyResponse(response: Response): Promise<CurrentlyPlayingResult> {
  if (response.status === HTTP_STATUS.NO_CONTENT) {
    return { ok: true, payload: emptyPayload() };
  }

  const body = await response.text();

  if (isSpotifyAccessRestricted(response.status, body)) {
    console.warn(LOG_MESSAGES.SPOTIFY.CURRENTLY_PLAYING_UNAVAILABLE, body.trim());
    return { ok: true, payload: emptyPayload() };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: ERROR_MESSAGES.SPOTIFY.FETCH_PLAYING_FAILED,
    };
  }

  const spotifyData = JSON.parse(body);
  return { ok: true, payload: SpotifyUtils.parseCurrentlyPlayingResponse(spotifyData) };
}

export async function getCurrentlyPlaying(): Promise<CurrentlyPlayingResult> {
  const tokenResult = await databaseService.getSpotifyToken();

  if (!tokenResult.success || !tokenResult.data) {
    return {
      ok: false,
      status: HTTP_STATUS.NOT_FOUND,
      error: ERROR_MESSAGES.SPOTIFY.NO_ACTIVE_TOKEN,
    };
  }

  let accessToken = tokenResult.data.access_token;
  const refreshToken = tokenResult.data.refresh_token;

  let response = await requestCurrentlyPlaying(accessToken);

  if (response.status === HTTP_STATUS.UNAUTHORIZED && refreshToken) {
    const refreshedToken = await refreshAccessToken(refreshToken);
    if (refreshedToken) {
      accessToken = refreshedToken;
      response = await requestCurrentlyPlaying(accessToken);
    }
  }

  return parseSpotifyResponse(response);
}

/**
 * Public metadata payload for visitors.
 * - Live playback → upsert last-played and return isPlaying: true
 * - Idle / error → fall back to last-played (isLastPlayed: true)
 * Never includes Spotify tokens.
 */
export async function getPublicNowPlayingPayload(): Promise<PublicNowPlayingPayload> {
  const result = await getCurrentlyPlaying();
  const spotify = DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY;

  if (result.ok && result.payload.isPlaying && result.payload.track) {
    // Update last-played on every live play (clears/replaces prior entry)
    await databaseService.saveMusicLastPlayed(spotify, result.payload.track);
    return {
      isPlaying: true,
      isLastPlayed: false,
      track: result.payload.track,
      timestamp: new Date().toISOString(),
    };
  }

  const last = await databaseService.getMusicLastPlayed(spotify);
  if (last) {
    return {
      isPlaying: false,
      isLastPlayed: true,
      track: toSimplifiedTrack(last),
      timestamp: last.playedAt instanceof Date ? last.playedAt.toISOString() : new Date(last.playedAt).toISOString(),
    };
  }

  return {
    isPlaying: false,
    isLastPlayed: false,
    track: null,
    timestamp: new Date().toISOString(),
  };
}
