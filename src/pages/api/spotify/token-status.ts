import { spotifyService } from "@/lib/spotify";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🔍 Checking Spotify token status...");

    const hasAccessToken = spotifyService.hasValidAccessToken();
    const hasRefreshToken = spotifyService.hasValidRefreshToken();

    const tokenInfo = {
      hasValidAccessToken: hasAccessToken,
      hasValidRefreshToken: hasRefreshToken,
      accessTokenExpiry: hasAccessToken
        ? new Date(spotifyService.getCurrentAccessToken() ? Date.now() + 3600000 : 0).toISOString()
        : null,
      timestamp: new Date().toISOString(),
    };

    console.log("📊 Token status:", tokenInfo);

    if (hasAccessToken) {
      return res.status(200).json({
        status: "ready",
        message: "Access token is valid and ready for API calls",
        ...tokenInfo,
      });
    } else if (hasRefreshToken) {
      return res.status(200).json({
        status: "needs_refresh",
        message: "Refresh token available, access token needs refresh",
        ...tokenInfo,
      });
    } else {
      return res.status(401).json({
        status: "no_tokens",
        message: "No valid tokens available",
        ...tokenInfo,
      });
    }
  } catch (error: any) {
    console.error("❌ Error checking token status:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to check token status",
      error: error.message,
    });
  }
}
