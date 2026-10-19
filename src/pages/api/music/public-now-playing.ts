import {
  handlePriorityPublicNowPlaying,
  handlePublicNowPlaying,
  isMusicAggregateServiceParam,
  requireMusicServiceId,
} from "@/lib/music-api";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Unified public now-playing / last-played metadata.
 * Sanitized track fields only — never credentials.
 *
 * - `?service=all` (or omit service): Spotify live → freshest non–youtube_music last-played within 30m
 * - `?service=spotify|youtube_music|apple_music`: that service only (admin previews)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (isMusicAggregateServiceParam(req)) {
    return handlePriorityPublicNowPlaying(req, res);
  }

  const service = requireMusicServiceId(req, res);
  if (!service) {
    return;
  }
  return handlePublicNowPlaying(req, res, service);
}
