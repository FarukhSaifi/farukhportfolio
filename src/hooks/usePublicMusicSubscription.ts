import type { MusicServiceId, PublicNowPlayingSnapshot, UseNowPlayingReturn } from "@/lib/interfaces";
import {
  refetchPriorityMusicNowPlaying,
  refetchPublicMusicNowPlaying,
  subscribePriorityMusicNowPlaying,
  subscribePublicMusicNowPlaying,
} from "@/lib/public-music-now-playing-client";
import { useCallback, useEffect, useMemo, useState } from "react";

const INITIAL_SNAPSHOT: PublicNowPlayingSnapshot = {
  payload: null,
  loading: true,
  error: null,
  source: null,
};

/**
 * Subscribe to a single-service public now-playing client.
 * Shared by Spotify / YouTube Music / Apple Music admin previews.
 */
export function usePublicMusicSubscription(service: MusicServiceId): UseNowPlayingReturn {
  const [snapshot, setSnapshot] = useState<PublicNowPlayingSnapshot>(INITIAL_SNAPSHOT);

  useEffect(() => {
    return subscribePublicMusicNowPlaying(service, setSnapshot);
  }, [service]);

  const refetch = useCallback(async () => {
    await refetchPublicMusicNowPlaying(service);
  }, [service]);

  return useMemo(
    () => ({
      payload: snapshot.payload,
      loading: snapshot.loading,
      error: snapshot.error,
      refetch,
    }),
    [snapshot.payload, snapshot.loading, snapshot.error, refetch],
  );
}

/**
 * About-page priority now-playing: Spotify live, else freshest last-played within 30 min.
 */
export function usePriorityMusicSubscription(): UseNowPlayingReturn & {
  source: PublicNowPlayingSnapshot["source"];
} {
  const [snapshot, setSnapshot] = useState<PublicNowPlayingSnapshot>(INITIAL_SNAPSHOT);

  useEffect(() => {
    return subscribePriorityMusicNowPlaying(setSnapshot);
  }, []);

  const refetch = useCallback(async () => {
    await refetchPriorityMusicNowPlaying();
  }, []);

  return useMemo(
    () => ({
      payload: snapshot.payload,
      loading: snapshot.loading,
      error: snapshot.error,
      source: snapshot.source,
      refetch,
    }),
    [snapshot.payload, snapshot.loading, snapshot.error, snapshot.source, refetch],
  );
}
