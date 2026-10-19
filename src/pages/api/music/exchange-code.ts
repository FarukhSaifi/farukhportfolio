import { DATABASE_CONFIG, ERROR_MESSAGES, HTTP_STATUS } from "@/lib/constants";
import {
  getOAuthLifecycle,
  handleAppleMusicExchangeCode,
  requireMusicServiceId,
} from "@/lib/music-api";
import { createExchangeCodeHandler } from "@/lib/music-oauth-lifecycle";
import { ApiUtils } from "@/lib/server-utils";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Unified token exchange / store.
 * Spotify / YouTube Music: OAuth code + PKCE (admin POST).
 * Apple Music: MusicKit userToken body (admin POST).
 * Requires `service` query or body.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const service = requireMusicServiceId(req, res);
  if (!service) {
    return;
  }

  if (service === DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC) {
    return handleAppleMusicExchangeCode(req, res);
  }

  const config = getOAuthLifecycle(service);
  if (!config) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.MUSIC.INVALID_SERVICE, HTTP_STATUS.BAD_REQUEST));
  }

  return createExchangeCodeHandler(config)(req, res);
}
