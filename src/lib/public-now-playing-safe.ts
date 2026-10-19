import { HTTP_STATUS, NETWORK, PUBLIC_NOW_PLAYING_RATE_LIMIT } from "@/lib/constants";
import type { PublicNowPlayingPayload, PublicNowPlayingRateBucket, SafePublicNowPlaying } from "@/lib/interfaces";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Strip any accidental extra fields before sending public now-playing JSON.
 * Only non-sensitive track metadata + playback flags leave the server.
 */
export function sanitizePublicNowPlayingPayload(payload: PublicNowPlayingPayload): SafePublicNowPlaying {
  const playedAt =
    typeof payload.timestamp === "string" && payload.timestamp ? payload.timestamp : new Date().toISOString();

  const track = payload.track
    ? {
        title: String(payload.track.title ?? ""),
        artist: String(payload.track.artist ?? ""),
        album: String(payload.track.album ?? ""),
        imageUrl: String(payload.track.imageUrl ?? ""),
        songUrl: String(payload.track.songUrl ?? ""),
      }
    : null;

  return {
    isPlaying: Boolean(payload.isPlaying),
    isLastPlayed: Boolean(payload.isLastPlayed),
    playedAt,
    timestamp: playedAt,
    track,
    ...(payload.source ? { source: payload.source } : {}),
  };
}

const rateBuckets = new Map<string, PublicNowPlayingRateBucket>();

function clientKey(req: NextApiRequest): string {
  const forwarded = req.headers[NETWORK.X_FORWARDED_FOR];
  const fromForwarded =
    typeof forwarded === "string" ? forwarded.split(",")[0]?.trim() : Array.isArray(forwarded) ? forwarded[0] : "";
  return fromForwarded || req.socket?.remoteAddress || NETWORK.UNKNOWN_CLIENT;
}

/**
 * Lightweight in-memory rate limit for public now-playing endpoints.
 * Best-effort on multi-instance deploys (per-process); no external dependency.
 */
export function enforcePublicNowPlayingRateLimit(req: NextApiRequest, res: NextApiResponse): boolean {
  const key = clientKey(req);
  const now = Date.now();
  let bucket = rateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + PUBLIC_NOW_PLAYING_RATE_LIMIT.WINDOW_MS };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;

  // Opportunistic cleanup to avoid unbounded growth
  if (rateBuckets.size > PUBLIC_NOW_PLAYING_RATE_LIMIT.BUCKET_CLEANUP_THRESHOLD) {
    for (const [k, v] of rateBuckets) {
      if (now >= v.resetAt) rateBuckets.delete(k);
    }
  }

  if (bucket.count > PUBLIC_NOW_PLAYING_RATE_LIMIT.MAX_PER_WINDOW) {
    const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader(NETWORK.RETRY_AFTER, String(retryAfter));
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
      success: false,
      error: PUBLIC_NOW_PLAYING_RATE_LIMIT.TOO_MANY_REQUESTS_ERROR,
      statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    });
    return false;
  }
  return true;
}
