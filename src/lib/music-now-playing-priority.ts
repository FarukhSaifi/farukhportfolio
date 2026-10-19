import { DATABASE_CONFIG } from "@/lib/constants";
import { databaseService } from "@/lib/database";
import type { PublicNowPlayingPayload, SimplifiedTrack } from "@/lib/interfaces";
import { getCurrentlyPlaying } from "@/lib/spotify-now-playing";

function parsePlayedAtMs(value: string | Date | undefined | null): number | null {
  if (value == null || value === "") {
    return null;
  }
  const ms = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function isWithinLastPlayedFreshness(playedAtMs: number, nowMs: number, freshnessMs: number): boolean {
  return nowMs - playedAtMs <= freshnessMs;
}

function emptyIdlePublicNowPlaying(timestampMs: number = Date.now()): PublicNowPlayingPayload {
  return {
    isPlaying: false,
    isLastPlayed: false,
    track: null,
    timestamp: new Date(timestampMs).toISOString(),
  };
}

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

/**
 * Server-side priority payload for About (`?service=all`).
 *
 * 1. Spotify live (real Player API) → currently listening
 * 2. Else freshest `music_last_played` within LAST_PLAYED_FRESHNESS_MS → last played
 *    (excludes `youtube_music`-labeled rows — About never shows YTM)
 * 3. Else idle / hidden
 */
export async function getPriorityPublicNowPlayingPayload(): Promise<PublicNowPlayingPayload> {
  const lastPlayedFreshnessMs = DATABASE_CONFIG.LAST_PLAYED_FRESHNESS_MS;
  const nowMs = Date.now();

  const live = await getCurrentlyPlaying();
  if (live.ok && live.payload.isPlaying && live.payload.track) {
    await databaseService.saveMusicLastPlayed(DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY, live.payload.track);
    const timestamp = new Date().toISOString();
    return {
      isPlaying: true,
      isLastPlayed: false,
      track: live.payload.track,
      timestamp,
      playedAt: timestamp,
      source: DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY,
    };
  }

  const newest = await databaseService.getNewestMusicLastPlayed({
    excludeServices: [DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC],
  });
  if (!newest?.playedAt) {
    return emptyIdlePublicNowPlaying(nowMs);
  }

  const playedAtMs = parsePlayedAtMs(newest.playedAt);
  if (playedAtMs == null || !isWithinLastPlayedFreshness(playedAtMs, nowMs, lastPlayedFreshnessMs)) {
    return emptyIdlePublicNowPlaying(nowMs);
  }

  const iso = new Date(playedAtMs).toISOString();
  const source = newest.service || DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY;
  return {
    isPlaying: false,
    isLastPlayed: true,
    track: toSimplifiedTrack(newest),
    timestamp: iso,
    playedAt: iso,
    source,
  };
}
