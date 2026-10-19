import { DATABASE_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import {
  getOAuthLifecycle,
  handleAppleMusicGetToken,
  requireMusicServiceId,
} from "@/lib/music-api";
import { createGetTokenHandler } from "@/lib/music-oauth-lifecycle";
import { ApiUtils } from "@/lib/server-utils";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Unified public-safe connection status (`{ isConnected }`).
 * Never returns tokens. Requires `?service=...`.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const service = requireMusicServiceId(req, res);
  if (!service) {
    return;
  }

  if (service === DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC) {
    return handleAppleMusicGetToken(req, res);
  }

  const config = getOAuthLifecycle(service);
  if (!config) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.MUSIC.INVALID_SERVICE, HTTP_STATUS.BAD_REQUEST));
  }

  return createGetTokenHandler(config)(req, res);
}
