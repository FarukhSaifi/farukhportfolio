import { useMusicServiceAuth } from "@/hooks/useMusicServiceAuth";
import { DATABASE_CONFIG, ERROR_MESSAGES, LOG_MESSAGES, YOUTUBE_MUSIC_CONFIG } from "@/lib/constants";

const SERVICE = DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC;

/** Connection status + OAuth actions only (no public now-playing detection). */
export function useYoutubeMusicAuth() {
  return useMusicServiceAuth({
    service: SERVICE,
    apiError: ERROR_MESSAGES.YOUTUBE_MUSIC.API_ERROR,
    logCheckAuth: LOG_MESSAGES.HOOKS.YOUTUBE_CHECK_AUTH,
    logDisconnect: LOG_MESSAGES.HOOKS.YOUTUBE_DISCONNECT,
    logRefresh: LOG_MESSAGES.HOOKS.YOUTUBE_REFRESH,
    throwOnActionFailure: true,
    disconnectFailedMessage: ERROR_MESSAGES.YOUTUBE_MUSIC.DISCONNECT_FAILED,
    refreshFailedMessage: ERROR_MESSAGES.YOUTUBE_MUSIC.REFRESH_FAILED,
    resolveAuthUrl: (path) => {
      // Align host with redirect_uri (127.0.0.1) so PKCE cookies survive the Google callback
      const authUrl = new URL(path, window.location.origin);
      if (window.location.hostname === YOUTUBE_MUSIC_CONFIG.LOCALHOST_HOST) {
        authUrl.hostname = YOUTUBE_MUSIC_CONFIG.LOOPBACK_HOST;
      }
      return authUrl.toString();
    },
  });
}
