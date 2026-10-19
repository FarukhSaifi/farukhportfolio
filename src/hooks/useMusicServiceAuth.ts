import { HTTP_METHODS, musicApiUrl } from "@/lib/constants";
import type { MusicServiceId } from "@/lib/interfaces";
import { useCallback, useEffect, useMemo, useState } from "react";

export type MusicServiceAuthReturn = {
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  authenticate: () => void | Promise<void>;
  disconnect: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
};

type MusicServiceAuthOptions = {
  service: MusicServiceId;
  apiError: string;
  logCheckAuth: string;
  logDisconnect: string;
  logRefresh: string;
  logAuthenticate?: string;
  /** Override default redirect-to-AUTH authenticate (e.g. Apple MusicKit). */
  authenticate?: () => Promise<void>;
  /** Rewrite auth URL before redirect (e.g. YouTube localhost → 127.0.0.1). */
  resolveAuthUrl?: (authUrl: string) => string;
  /** Throw after failed disconnect/refresh (YouTube/Apple panels await errors). */
  throwOnActionFailure?: boolean;
  disconnectFailedMessage?: string;
  refreshFailedMessage?: string;
  /** Extra work after successful disconnect/refresh (e.g. refetch public preview). */
  afterDisconnect?: () => Promise<void>;
  afterRefresh?: () => Promise<void>;
};

/**
 * Shared admin connection status + disconnect/refresh for music services.
 * Spotify/YouTube use redirect AUTH; Apple supplies a custom authenticate.
 */
export function useMusicServiceAuth(options: MusicServiceAuthOptions): MusicServiceAuthReturn {
  const {
    service,
    apiError,
    logCheckAuth,
    logDisconnect,
    logRefresh,
    authenticate: customAuthenticate,
    resolveAuthUrl,
    throwOnActionFailure = false,
    disconnectFailedMessage,
    refreshFailedMessage,
    afterDisconnect,
    afterRefresh,
    logAuthenticate,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(musicApiUrl("GET_TOKEN", service), {
        method: HTTP_METHODS.GET,
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setIsConnected(Boolean(data.data?.isConnected));
      } else {
        setIsConnected(false);
      }
    } catch (err: unknown) {
      console.error(logCheckAuth, err);
      setIsConnected(false);
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, [service, apiError, logCheckAuth]);

  const authenticate = useCallback(() => {
    if (!customAuthenticate) {
      const path = musicApiUrl("AUTH", service);
      window.location.href = resolveAuthUrl ? resolveAuthUrl(path) : path;
      return;
    }

    return (async () => {
      try {
        setError(null);
        await customAuthenticate();
        setIsConnected(true);
      } catch (err: unknown) {
        if (logAuthenticate) {
          console.error(logAuthenticate, err);
        }
        setError(apiError);
        throw err;
      }
    })();
  }, [customAuthenticate, resolveAuthUrl, service, apiError, logAuthenticate]);

  const disconnect = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(musicApiUrl("DISCONNECT", service), {
        method: HTTP_METHODS.DELETE,
      });
      if (!response.ok) {
        setError(apiError);
        if (throwOnActionFailure) {
          throw new Error(disconnectFailedMessage || apiError);
        }
        return;
      }
      setIsConnected(false);
      if (afterDisconnect) {
        await afterDisconnect();
      }
    } catch (err: unknown) {
      console.error(logDisconnect, err);
      setError(apiError);
      if (throwOnActionFailure) {
        throw err;
      }
    }
  }, [service, apiError, logDisconnect, throwOnActionFailure, disconnectFailedMessage, afterDisconnect]);

  const refreshToken = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(musicApiUrl("REFRESH_TOKEN", service), {
        method: HTTP_METHODS.POST,
      });
      if (!response.ok) {
        setError(apiError);
        if (throwOnActionFailure) {
          throw new Error(refreshFailedMessage || apiError);
        }
        return;
      }
      await checkAuthStatus();
      if (afterRefresh) {
        await afterRefresh();
      }
    } catch (err: unknown) {
      console.error(logRefresh, err);
      setError(apiError);
      if (throwOnActionFailure) {
        throw err;
      }
    }
  }, [service, apiError, logRefresh, throwOnActionFailure, refreshFailedMessage, checkAuthStatus, afterRefresh]);

  useEffect(() => {
    void checkAuthStatus();
  }, [checkAuthStatus]);

  return useMemo(
    () => ({
      isConnected,
      loading,
      error,
      authenticate,
      disconnect,
      refreshToken,
      checkAuthStatus,
    }),
    [isConnected, loading, error, authenticate, disconnect, refreshToken, checkAuthStatus],
  );
}
