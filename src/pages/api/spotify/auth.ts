import { HTTP_STATUS, SPOTIFY_CONFIG } from "@/lib/constants";
import { ApiUtils, EnvironmentUtils } from "@/lib/server-utils";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: Spotify Authentication
 *
 * Initiates Spotify OAuth flow by redirecting to Spotify's authorization endpoint.
 * This endpoint generates the authorization URL with proper scopes and redirect URI.
 *
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @returns Redirect to Spotify authorization URL
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== "GET") {
    return res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse("Method not allowed", HTTP_STATUS.METHOD_NOT_ALLOWED));
  }

  try {
    // Get Spotify client ID from environment
    const clientId = EnvironmentUtils.getSpotifyClientId();

    if (!clientId) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          ApiUtils.createErrorResponse(
            "Spotify client ID not configured",
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ),
        );
    }

    // Get redirect URI based on environment
    const redirectUri = EnvironmentUtils.isProduction()
      ? `${EnvironmentUtils.getBaseUrl()}/spotify-success`
      : SPOTIFY_CONFIG.REDIRECT_URI.DEVELOPMENT;

    // Build Spotify authorization URL
    const authUrl = new URL(SPOTIFY_CONFIG.AUTHORIZE_URL);
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", SPOTIFY_CONFIG.SCOPES.join(" "));
    authUrl.searchParams.set("show_dialog", "true");

    // Redirect to Spotify authorization page
    return res.redirect(authUrl.toString());
  } catch (error: any) {
    // Log error for debugging
    console.error("Spotify auth error:", error);

    // Handle and return standardized error response
    const errorResponse = ApiUtils.handleApiError(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
