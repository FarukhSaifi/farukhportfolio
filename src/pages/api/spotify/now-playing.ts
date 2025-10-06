import { HTTP_STATUS, SPOTIFY_CONFIG } from "@/lib/constants";
import { databaseService } from "@/lib/database";
import { ApiUtils, SpotifyUtils } from "@/lib/server-utils";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: Get Currently Playing Track
 *
 * Fetches the currently playing track from Spotify API using stored tokens.
 * Handles token refresh automatically if the access token is expired.
 *
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @returns JSON response with currently playing track data
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== "GET") {
    return res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse("Method not allowed", HTTP_STATUS.METHOD_NOT_ALLOWED));
  }

  try {
    // Get token from database (with automatic refresh if needed)
    const tokenResult = await databaseService.getSpotifyToken();

    if (!tokenResult.success || !tokenResult.data) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(ApiUtils.createErrorResponse("No active Spotify token found", HTTP_STATUS.NOT_FOUND));
    }

    const { access_token, refresh_token } = tokenResult.data;

    // Get current playing track from Spotify API
    const spotifyResponse = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me/player/currently-playing`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });

    // Handle no content response (not playing anything)
    if (spotifyResponse.status === HTTP_STATUS.NO_CONTENT) {
      return res.status(HTTP_STATUS.OK).json(
        ApiUtils.createSuccessResponse({
          isPlaying: false,
          track: null,
        })
      );
    }

    // Handle 401 - token expired, try to refresh
    if (spotifyResponse.status === HTTP_STATUS.UNAUTHORIZED) {
      console.log("🔄 Access token expired, attempting refresh...");

      if (!refresh_token) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(
            ApiUtils.createErrorResponse(
              "Refresh token not available. Please re-authenticate.",
              HTTP_STATUS.UNAUTHORIZED
            )
          );
      }

      const refreshResult = await SpotifyUtils.refreshSpotifyToken(refresh_token);
      if (refreshResult) {
        // Update token in database
        await databaseService.updateSpotifyToken({
          access_token: refreshResult.access_token,
          expires_in: refreshResult.expires_in,
          token_type: refreshResult.token_type,
        });

        // Retry with new token
        const retryResponse = await fetch(`${SPOTIFY_CONFIG.API_BASE_URL}/me/player/currently-playing`, {
          headers: {
            Authorization: `Bearer ${refreshResult.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          const parsedData = SpotifyUtils.parseCurrentlyPlayingResponse(retryData);

          return res.status(HTTP_STATUS.OK).json(ApiUtils.createSuccessResponse(parsedData));
        } else {
          return res
            .status(retryResponse.status)
            .json(
              ApiUtils.createErrorResponse("Failed to get current playing track after refresh", retryResponse.status)
            );
        }
      } else {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(ApiUtils.createErrorResponse("Failed to refresh Spotify token", HTTP_STATUS.UNAUTHORIZED));
      }
    }

    // Handle other error responses
    if (!spotifyResponse.ok) {
      return res
        .status(spotifyResponse.status)
        .json(ApiUtils.createErrorResponse("Failed to get current playing track from Spotify", spotifyResponse.status));
    }

    // Parse successful response
    const spotifyData = await spotifyResponse.json();
    const parsedData = SpotifyUtils.parseCurrentlyPlayingResponse(spotifyData);

    return res.status(HTTP_STATUS.OK).json(ApiUtils.createSuccessResponse(parsedData));
  } catch (error: any) {
    // Log error for debugging
    console.error("Error getting now playing:", error);

    // Handle and return standardized error response
    const errorResponse = ApiUtils.handleApiError(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
