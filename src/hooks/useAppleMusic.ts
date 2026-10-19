import { useMusicServiceAuth } from "@/hooks/useMusicServiceAuth";
import { usePublicMusicSubscription } from "@/hooks/usePublicMusicSubscription";
import {
  APPLE_MUSIC_CONFIG,
  DATABASE_CONFIG,
  ERROR_MESSAGES,
  HTTP_METHODS,
  LOG_MESSAGES,
  musicApiUrl,
} from "@/lib/constants";
import type { UseNowPlayingReturn } from "@/lib/interfaces";
import { authorizeAppleMusicUser } from "@/lib/musickit-client";
import { refetchPublicMusicNowPlaying } from "@/lib/public-music-now-playing-client";
import { useCallback } from "react";

const SERVICE = DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC;

export function usePublicAppleMusicNowPlaying(): UseNowPlayingReturn {
  return usePublicMusicSubscription(SERVICE);
}

export function useAppleMusicAuth() {
  const authenticate = useCallback(async () => {
    const authResponse = await fetch(musicApiUrl("AUTH", SERVICE), {
      method: HTTP_METHODS.GET,
      credentials: APPLE_MUSIC_CONFIG.FETCH_CREDENTIALS,
    });
    const authData = await authResponse.json();
    if (!authResponse.ok || !authData.success) {
      throw new Error(authData.error || ERROR_MESSAGES.APPLE_MUSIC.AUTH_FAILED);
    }

    const developerToken = authData.data?.developerToken as string | undefined;
    const musicKitId = authData.data?.musicKitId as string | undefined;
    if (!developerToken || !musicKitId) {
      throw new Error(ERROR_MESSAGES.APPLE_MUSIC.AUTH_FAILED);
    }

    const userToken = await authorizeAppleMusicUser(developerToken, musicKitId);

    const exchangeResponse = await fetch(musicApiUrl("EXCHANGE_CODE", SERVICE), {
      method: HTTP_METHODS.POST,
      credentials: APPLE_MUSIC_CONFIG.FETCH_CREDENTIALS,
      headers: { [APPLE_MUSIC_CONFIG.HEADERS.CONTENT_TYPE]: APPLE_MUSIC_CONFIG.HEADERS.JSON },
      body: JSON.stringify({ userToken }),
    });
    const exchangeData = await exchangeResponse.json();
    if (!exchangeResponse.ok || !exchangeData.success) {
      throw new Error(exchangeData.error || ERROR_MESSAGES.APPLE_MUSIC.SAVE_FAILED);
    }

    await refetchPublicMusicNowPlaying(SERVICE);
  }, []);

  return useMusicServiceAuth({
    service: SERVICE,
    apiError: ERROR_MESSAGES.APPLE_MUSIC.API_ERROR,
    logCheckAuth: LOG_MESSAGES.HOOKS.APPLE_CHECK_AUTH,
    logDisconnect: LOG_MESSAGES.HOOKS.APPLE_DISCONNECT,
    logRefresh: LOG_MESSAGES.HOOKS.APPLE_REFRESH,
    logAuthenticate: LOG_MESSAGES.HOOKS.APPLE_CONNECT,
    throwOnActionFailure: true,
    disconnectFailedMessage: ERROR_MESSAGES.APPLE_MUSIC.DISCONNECT_FAILED,
    refreshFailedMessage: ERROR_MESSAGES.APPLE_MUSIC.REFRESH_FAILED,
    authenticate,
    afterDisconnect: () => refetchPublicMusicNowPlaying(SERVICE),
    afterRefresh: () => refetchPublicMusicNowPlaying(SERVICE),
  });
}
