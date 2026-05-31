import { HTTP_STATUS } from "@/lib/constants";
import { ApiUtils } from "@/lib/server-utils";
import { getCurrentlyPlaying } from "@/lib/spotify-now-playing";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: Get Currently Playing Track
 *
 * Fetches the currently playing track from Spotify API using stored tokens.
 * Handles token refresh and Spotify dev-mode access restrictions gracefully.
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

    return res.status(HTTP_STATUS.OK).json(ApiUtils.createSuccessResponse(result.payload));
  } catch (error: unknown) {
    console.error("Error getting now playing:", error);
    const errorResponse = ApiUtils.handleApiError(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
