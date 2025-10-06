import { HTTP_STATUS } from "@/lib/constants";
import { databaseService } from "@/lib/database";
import { ApiUtils } from "@/lib/server-utils";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: Get Spotify Token
 *
 * Retrieves the current Spotify token from the database.
 * This endpoint is used to check if Spotify is connected and get token information.
 *
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @returns JSON response with Spotify token data or error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== "GET") {
    return res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse("Method not allowed", HTTP_STATUS.METHOD_NOT_ALLOWED));
  }

  try {
    // Get Spotify token from database
    const result = await databaseService.getSpotifyToken();

    // Handle successful token retrieval
    if (result.success && result.data) {
      return res.status(HTTP_STATUS.OK).json(
        ApiUtils.createSuccessResponse(
          {
            isConnected: true,
            token: {
              access_token: result.data.access_token,
              refresh_token: result.data.refresh_token,
              expires_in: result.data.expires_in,
              token_type: result.data.token_type,
              last_updated: result.data.last_updated,
            },
          },
          "Spotify token retrieved successfully"
        )
      );
    }

    // Handle no token found
    return res
      .status(HTTP_STATUS.NOT_FOUND)
      .json(ApiUtils.createErrorResponse(result.error || "No active Spotify token found", HTTP_STATUS.NOT_FOUND));
  } catch (error: any) {
    // Log error for debugging
    console.error("Error getting Spotify token:", error);

    // Handle and return standardized error response
    const errorResponse = ApiUtils.handleApiError(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
