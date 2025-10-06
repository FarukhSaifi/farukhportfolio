import { HTTP_STATUS, SPOTIFY_CONFIG } from "@/lib/constants";
import { databaseService } from "@/lib/database";
import { ApiUtils, SpotifyUtils } from "@/lib/server-utils";
import { PublicNowPlayingPayload } from "@/lib/types";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: Get Public Currently Playing Track
 *
 * Fetches the currently playing track from Spotify API for public consumption.
 * This endpoint provides a simplified version of the now-playing data for public display.
 *
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @returns JSON response with public currently playing track data
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== "GET") {
    return res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse("Method not allowed", HTTP_STATUS.METHOD_NOT_ALLOWED));
  }

  try {
    // Get token from database
    const tokenResult = await databaseService.getSpotifyToken();

    if (!tokenResult.success || !tokenResult.data) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(ApiUtils.createErrorResponse("No active Spotify token found", HTTP_STATUS.NOT_FOUND));
    }

    const { access_token } = tokenResult.data;

    // Get current playing track from Spotify API
    const spotifyResponse = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me/player/currently-playing`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    // Handle no content response (not playing anything)
    if (spotifyResponse.status === HTTP_STATUS.NO_CONTENT) {
      const response: PublicNowPlayingPayload = {
        isPlaying: false,
        track: null,
        timestamp: new Date().toISOString(),
      };

      return res.status(HTTP_STATUS.OK).json(ApiUtils.createSuccessResponse(response));
    }

    // Handle error responses
    if (!spotifyResponse.ok) {
      return res
        .status(spotifyResponse.status)
        .json(ApiUtils.createErrorResponse("Failed to get current playing track from Spotify", spotifyResponse.status));
    }

    // Parse successful response
    const spotifyData = await spotifyResponse.json();
    const parsedData = SpotifyUtils.parseCurrentlyPlayingResponse(spotifyData);

    // Create public response with timestamp
    const response: PublicNowPlayingPayload = {
      ...parsedData,
      timestamp: new Date().toISOString(),
    };

    return res.status(HTTP_STATUS.OK).json(ApiUtils.createSuccessResponse(response));
  } catch (error: any) {
    // Log error for debugging
    console.error("Error getting public now playing:", error);

    // Handle and return standardized error response
    const errorResponse = ApiUtils.handleApiError(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
