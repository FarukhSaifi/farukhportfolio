import { HTTP_STATUS, SPOTIFY_CONFIG } from "@/lib/constants";
import { ApiUtils, EnvironmentUtils, SpotifyUtils } from "@/lib/server-utils";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: Exchange Spotify Authorization Code
 *
 * Exchanges the authorization code received from Spotify OAuth flow for access and refresh tokens.
 * This endpoint handles the token exchange process with proper error handling.
 *
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @returns JSON response with Spotify tokens
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== "POST") {
    return res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse("Method not allowed", HTTP_STATUS.METHOD_NOT_ALLOWED));
  }

  try {
    // Extract authorization code from request body
    const { code } = req.body;

    // Validate required fields
    if (!code) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(
          ApiUtils.createErrorResponse("Authorization code is required", HTTP_STATUS.BAD_REQUEST),
        );
    }

    // Validate input type
    if (typeof code !== "string") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(
          ApiUtils.createErrorResponse(
            "Invalid authorization code format",
            HTTP_STATUS.BAD_REQUEST,
          ),
        );
    }

    // Sanitize authorization code
    const sanitizedCode = code.trim();

    // Get Spotify credentials from environment
    const clientId = EnvironmentUtils.getSpotifyClientId();
    const clientSecret = EnvironmentUtils.getSpotifyClientSecret();

    // Get redirect URI based on environment
    const redirectUri = SpotifyUtils.getRedirectUri();

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch(SPOTIFY_CONFIG.AUTH_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: sanitizedCode,
        redirect_uri: redirectUri,
      }),
    });

    // Handle token exchange response
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("❌ Spotify token exchange failed:", errorData);

      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        ApiUtils.createErrorResponse(
          "Failed to exchange authorization code",
          HTTP_STATUS.BAD_REQUEST,
          {
            details: errorData,
          },
        ),
      );
    }

    // Parse successful token response
    const tokenData = await tokenResponse.json();

    // Log successful token exchange (without sensitive data)
    console.log("✅ Successfully exchanged code for tokens");
    console.log("🔑 Access token received:", tokenData.access_token ? "Yes" : "No");
    console.log("🔄 Refresh token received:", tokenData.refresh_token ? "Yes" : "No");
    console.log("⏰ Expires in:", tokenData.expires_in, "seconds");

    // Validate token response structure
    if (!tokenData.access_token || !tokenData.refresh_token) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(
          ApiUtils.createErrorResponse(
            "Invalid token response from Spotify",
            HTTP_STATUS.BAD_REQUEST,
          ),
        );
    }

    // Return the tokens to the client
    return res.status(HTTP_STATUS.OK).json(
      ApiUtils.createSuccessResponse(
        {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_in: tokenData.expires_in,
          token_type: tokenData.token_type || "Bearer",
        },
        "Tokens exchanged successfully",
      ),
    );
  } catch (error: any) {
    // Log error for debugging
    console.error("❌ Error in token exchange:", error);

    // Handle and return standardized error response
    const errorResponse = ApiUtils.handleApiError(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
