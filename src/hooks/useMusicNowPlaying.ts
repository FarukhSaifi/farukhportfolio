import { usePriorityMusicSubscription } from "@/hooks/usePublicMusicSubscription";

/**
 * About-page priority now-playing: Spotify live first, else freshest music_last_played within 30 min.
 */
export function usePriorityMusicNowPlaying() {
  return usePriorityMusicSubscription();
}
