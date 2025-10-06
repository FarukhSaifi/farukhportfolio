import { useDatabaseSpotify } from "@/contexts/DatabaseSpotifyContext";
import { API_ENDPOINTS, ERROR_MESSAGES, SPOTIFY_CONFIG } from "@/lib/constants";
import { NowPlayingPayload, UseNowPlayingReturn } from "@/lib/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// Custom hook for Spotify now playing with optimized polling
export function useSpotifyNowPlaying(): UseNowPlayingReturn {
  const [payload, setPayload] = useState<NowPlayingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { getValidAccessToken } = useDatabaseSpotify();

  const pollTimerRef = useRef<number | null>(null);
  const etagRef = useRef<string | undefined>(undefined);
  const retryCountRef = useRef(0);
  const inFlightRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchNowPlaying = useCallback(async () => {
    if (inFlightRef.current) return;

    try {
      inFlightRef.current = true;
      setLoading(true);
      setError(null);

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      // Get valid access token (with automatic refresh if needed)
      const accessToken = await getValidAccessToken();
      if (!accessToken) {
        throw new Error("No valid Spotify token available");
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      if (etagRef.current) {
        headers["If-None-Match"] = etagRef.current;
      }

      const response = await fetch(API_ENDPOINTS.SPOTIFY.NOW_PLAYING, {
        headers,
        signal: abortControllerRef.current.signal,
      });

      if (response.status === 304) {
        // Not Modified
        setLoading(false);
        retryCountRef.current = 0;
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: NowPlayingPayload = await response.json();
      setPayload(data);
      etagRef.current = response.headers.get("ETag") || undefined;
      retryCountRef.current = 0;
    } catch (err: any) {
      if (err.name === "AbortError") return;

      console.error("Error fetching Spotify data:", err);
      setError(err.message || ERROR_MESSAGES.SPOTIFY.API_ERROR);

      // Implement exponential backoff
      if (retryCountRef.current < SPOTIFY_CONFIG.RETRY_CONFIG.MAX_RETRIES) {
        retryCountRef.current++;
        const delay = Math.min(
          SPOTIFY_CONFIG.RETRY_CONFIG.BASE_DELAY * Math.pow(2, retryCountRef.current - 1),
          SPOTIFY_CONFIG.RETRY_CONFIG.MAX_DELAY
        );

        setTimeout(() => {
          fetchNowPlaying();
        }, delay);
      }
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [getValidAccessToken]);

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;

    const poll = () => {
      fetchNowPlaying();
      const interval = payload?.isPlaying
        ? SPOTIFY_CONFIG.POLLING_INTERVALS.ACTIVE
        : SPOTIFY_CONFIG.POLLING_INTERVALS.IDLE;

      pollTimerRef.current = window.setTimeout(poll, interval);
    };

    poll();
  }, [fetchNowPlaying, payload?.isPlaying]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchNowPlaying();
        startPolling();
      } else {
        stopPolling();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopPolling();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNowPlaying, startPolling, stopPolling]);

  return useMemo(() => ({ payload, loading, error }), [payload, loading, error]);
}

// Custom hook for public Spotify now playing
export function usePublicSpotifyNowPlaying(): UseNowPlayingReturn {
  const [payload, setPayload] = useState<NowPlayingPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPublicNowPlaying = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.SPOTIFY.PUBLIC_NOW_PLAYING);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setPayload(data.data);
      } else {
        setError(data.error || ERROR_MESSAGES.SPOTIFY.API_ERROR);
      }
    } catch (err: any) {
      console.error("Error fetching public Spotify data:", err);
      setError(err.message || ERROR_MESSAGES.SPOTIFY.API_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicNowPlaying();

    // Poll every 30 seconds for public data
    const interval = setInterval(fetchPublicNowPlaying, 30000);

    return () => clearInterval(interval);
  }, [fetchPublicNowPlaying]);

  return useMemo(() => ({ payload, loading, error }), [payload, loading, error]);
}

// Custom hook for Spotify authentication status
export function useSpotifyAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.SPOTIFY.GET_TOKEN);
      const data = await response.json();

      setIsAuthenticated(data.success && data.data);
    } catch (err: any) {
      console.error("Error checking Spotify auth status:", err);
      setError(err.message);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const authenticate = useCallback(() => {
    window.location.href = API_ENDPOINTS.SPOTIFY.AUTH;
  }, []);

  const disconnect = useCallback(async () => {
    try {
      // Clear tokens from database
      await fetch(API_ENDPOINTS.SPOTIFY.SAVE_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_token: "",
          refresh_token: "",
          expires_in: 0,
          token_type: "",
        }),
      });

      setIsAuthenticated(false);
    } catch (err: any) {
      console.error("Error disconnecting Spotify:", err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    isAuthenticated,
    loading,
    error,
    authenticate,
    disconnect,
    checkAuthStatus,
  };
}
