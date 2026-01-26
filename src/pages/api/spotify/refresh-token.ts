import { HTTP_STATUS } from "@/lib/constants";
import { databaseService } from "@/lib/database";
import { ApiUtils, SpotifyUtils } from "@/lib/server-utils";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: Refresh Spotify Token
 *
 * Refreshes an expired Spotify access token using the refresh token.
 * Updates the database with the new token information.
 *
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @returns JSON response with refreshed token data
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== "POST") {
    return res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse("Method not allowed", HTTP_STATUS.METHOD_NOT_ALLOWED));
  }

  try {
    // Extract refresh token from request body
    const { refresh_token } = req.body;

    // Validate required fields
    if (!refresh_token) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiUtils.createErrorResponse("Refresh token is required", HTTP_STATUS.BAD_REQUEST));
    }

    // Validate input type
    if (typeof refresh_token !== "string") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(
          ApiUtils.createErrorResponse("Invalid refresh token format", HTTP_STATUS.BAD_REQUEST),
        );
    }

    // Sanitize refresh token
    const sanitizedRefreshToken = refresh_token.trim();

    // Refresh the token using Spotify API
    const refreshResult = await SpotifyUtils.refreshSpotifyToken(sanitizedRefreshToken);

    if (!refreshResult) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiUtils.createErrorResponse("Failed to refresh token", HTTP_STATUS.UNAUTHORIZED));
    }

    // Update token in database
    const updateResult = await databaseService.updateSpotifyToken({
      access_token: refreshResult.access_token,
      expires_in: refreshResult.expires_in,
      token_type: refreshResult.token_type,
    });

    // Log database update result
    if (!updateResult.success) {
      console.error("Failed to update token in database:", updateResult.error);
    }

    // Return refreshed token data
    return res.status(HTTP_STATUS.OK).json(
      ApiUtils.createSuccessResponse(
        {
          access_token: refreshResult.access_token,
          expires_in: refreshResult.expires_in,
          token_type: refreshResult.token_type,
        },
        "Token refreshed successfully",
      ),
    );
  } catch (error: any) {
    // Log error for debugging
    console.error("Error refreshing token:", error);

    // Handle and return standardized error response
    const errorResponse = ApiUtils.handleApiError(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
