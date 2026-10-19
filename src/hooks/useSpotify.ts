import { useMusicServiceAuth } from "@/hooks/useMusicServiceAuth";
import { usePublicMusicSubscription } from "@/hooks/usePublicMusicSubscription";
import { DATABASE_CONFIG, ERROR_MESSAGES, LOG_MESSAGES, STORAGE_KEYS } from "@/lib/constants";
import type { UseNowPlayingReturn } from "@/lib/interfaces";
import { useEffect } from "react";

const SERVICE = DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY;

/**
 * Public now-playing hook.
 * Subscribes to a module-level client so Strict Mode remounts / route transitions
 * cannot cancel the in-flight public now-playing request. Never reads tokens.
 */
export function usePublicSpotifyNowPlaying(): UseNowPlayingReturn {
  useEffect(() => {
    // Clear any legacy browser-stored Spotify secrets from older clients
    try {
      window.localStorage.removeItem(STORAGE_KEYS.SPOTIFY_REFRESH_TOKEN);
      window.localStorage.removeItem(STORAGE_KEYS.SPOTIFY_ACCESS_TOKEN);
      window.localStorage.removeItem(STORAGE_KEYS.SPOTIFY_TOKEN_EXPIRY);
    } catch {
      // ignore storage access errors
    }
  }, []);

  return usePublicMusicSubscription(SERVICE);
}

/**
 * Connection status only (no tokens). Used by admin tooling.
 */
export function useSpotifyAuth() {
  return useMusicServiceAuth({
    service: SERVICE,
    apiError: ERROR_MESSAGES.SPOTIFY.API_ERROR,
    logCheckAuth: LOG_MESSAGES.HOOKS.SPOTIFY_CHECK_AUTH,
    logDisconnect: LOG_MESSAGES.HOOKS.SPOTIFY_DISCONNECT,
    logRefresh: LOG_MESSAGES.HOOKS.SPOTIFY_REFRESH,
  });
}
