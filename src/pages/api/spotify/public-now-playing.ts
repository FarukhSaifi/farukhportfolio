import { HTTP_STATUS } from "@/lib/constants";
import { PublicNowPlayingPayload } from "@/lib/interfaces";
import { ApiUtils } from "@/lib/server-utils";
import { getCurrentlyPlaying } from "@/lib/spotify-now-playing";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: Get Public Currently Playing Track
 *
 * Fetches the currently playing track from Spotify API for public consumption.
 * Returns an idle payload when Spotify access is unavailable (e.g. dev-mode Premium requirement).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse("Method not allowed", HTTP_STATUS.METHOD_NOT_ALLOWED));
  }

  try {
    const result = await getCurrentlyPlaying();

    if (!result.ok) {
      return res.status(result.status).json(ApiUtils.createErrorResponse(result.error, result.status));
    }

    const response: PublicNowPlayingPayload = {
      ...result.payload,
      timestamp: new Date().toISOString(),
    };

    return res.status(HTTP_STATUS.OK).json(ApiUtils.createSuccessResponse(response));
  } catch (error: unknown) {
    console.error("Error getting public now playing:", error);
    const errorResponse = ApiUtils.handleApiError(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
