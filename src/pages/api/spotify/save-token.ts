import { DATABASE_CONFIG, HTTP_STATUS } from "@/lib/constants";
import { databaseService } from "@/lib/database";
import { ApiUtils } from "@/lib/server-utils";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: Save Spotify Token
 *
 * Saves Spotify access and refresh tokens to the database for public access.
 * This endpoint is used after successful Spotify OAuth authentication.
 *
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @returns JSON response with success/error status
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== "POST") {
    return res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse("Method not allowed", HTTP_STATUS.METHOD_NOT_ALLOWED));
  }

  try {
    // Extract token data from request body
    const { access_token, refresh_token, expires_in, token_type } = req.body;

    // Validate required fields
    if (!access_token || !refresh_token) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiUtils.createErrorResponse("Access token and refresh token are required", HTTP_STATUS.BAD_REQUEST));
    }

    // Validate token format
    if (typeof access_token !== "string" || typeof refresh_token !== "string") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiUtils.createErrorResponse("Invalid token format", HTTP_STATUS.BAD_REQUEST));
    }

    // Prepare token data for database
    const tokenData = {
      user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
      access_token: access_token.trim(),
      refresh_token: refresh_token.trim(),
      expires_in: expires_in || 3600,
      token_type: token_type || "Bearer",
      is_active: true,
    };

    // Save token to database
    const result = await databaseService.saveSpotifyToken(tokenData);

    // Handle database operation result
    if (result.success) {
      return res
        .status(HTTP_STATUS.OK)
        .json(ApiUtils.createSuccessResponse(result.data, "Spotify token saved successfully"));
    } else {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          ApiUtils.createErrorResponse(
            result.error || "Failed to save Spotify token",
            HTTP_STATUS.INTERNAL_SERVER_ERROR
          )
        );
    }
  } catch (error: any) {
    // Log error for debugging
    console.error("Error saving Spotify token:", error);

    // Handle and return standardized error response
    const errorResponse = ApiUtils.handleApiError(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
