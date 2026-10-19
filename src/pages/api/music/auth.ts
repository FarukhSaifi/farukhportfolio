import { DATABASE_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import {
  getOAuthLifecycle,
  handleAppleMusicAuth,
  requireMusicServiceId,
} from "@/lib/music-api";
import { createAuthHandler } from "@/lib/music-oauth-lifecycle";
import { ApiUtils } from "@/lib/server-utils";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Unified music auth start.
 * Spotify / YouTube Music: OAuth + PKCE redirect (admin).
 * Apple Music: MusicKit developer JWT bootstrap JSON (admin).
 * Requires `?service=spotify|youtube_music|apple_music`.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const service = requireMusicServiceId(req, res);
  if (!service) {
    return;
  }

  if (service === DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC) {
    return handleAppleMusicAuth(req, res);
  }

  const config = getOAuthLifecycle(service);
  if (!config) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.MUSIC.INVALID_SERVICE, HTTP_STATUS.BAD_REQUEST));
  }

  return createAuthHandler(config)(req, res);
}
