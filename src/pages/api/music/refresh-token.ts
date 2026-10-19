import { DATABASE_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import {
  getOAuthLifecycle,
  handleAppleMusicRefreshToken,
  requireMusicServiceId,
} from "@/lib/music-api";
import { createRefreshTokenHandler } from "@/lib/music-oauth-lifecycle";
import { ApiUtils } from "@/lib/server-utils";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Unified admin token refresh / revalidation.
 * Requires `service` query or body.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const service = requireMusicServiceId(req, res);
  if (!service) {
    return;
  }

  if (service === DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC) {
    return handleAppleMusicRefreshToken(req, res);
  }

  const config = getOAuthLifecycle(service);
  if (!config) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.MUSIC.INVALID_SERVICE, HTTP_STATUS.BAD_REQUEST));
  }

  return createRefreshTokenHandler(config)(req, res);
}
