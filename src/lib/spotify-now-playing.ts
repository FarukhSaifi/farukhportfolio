import { HTTP_STATUS, SPOTIFY_CONFIG } from "@/lib/constants";
import { databaseService } from "@/lib/database";
import { NowPlayingPayload } from "@/lib/interfaces";
import { SpotifyUtils } from "@/lib/server-utils";

type CurrentlyPlayingResult = { ok: true; payload: NowPlayingPayload } | { ok: false; status: number; error: string };

function emptyPayload(): NowPlayingPayload {
  return { isPlaying: false, track: null };
}

function isSpotifyAccessRestricted(status: number, body: string): boolean {
  if (status !== HTTP_STATUS.FORBIDDEN) return false;
  return /premium subscription required/i.test(body);
}

async function requestCurrentlyPlaying(accessToken: string): Promise<Response> {
  return fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me/player/currently-playing`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const refreshResult = await SpotifyUtils.refreshSpotifyToken(refreshToken);
  if (!refreshResult) return null;

  const updateResult = await databaseService.updateSpotifyToken({
    access_token: refreshResult.access_token,
    expires_in: refreshResult.expires_in,
    token_type: refreshResult.token_type,
  });

  if (!updateResult.success) {
    console.error("Failed to persist refreshed Spotify token:", updateResult.error);
  }

  return refreshResult.access_token;
}

async function parseSpotifyResponse(response: Response): Promise<CurrentlyPlayingResult> {
  if (response.status === HTTP_STATUS.NO_CONTENT) {
    return { ok: true, payload: emptyPayload() };
  }

  const body = await response.text();

  if (isSpotifyAccessRestricted(response.status, body)) {
    console.warn("Spotify currently-playing unavailable:", body.trim());
    return { ok: true, payload: emptyPayload() };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      error: "Failed to get current playing track from Spotify",
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
      error: "No active Spotify token found",
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
