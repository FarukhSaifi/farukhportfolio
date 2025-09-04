import { spotifyService } from "@/lib/spotify";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🎵 Handling Spotify now-playing API request...");

    // Get token from request headers (client sends stored token)
    const clientToken = req.headers["x-spotify-token"] as string;
    const tokenType = req.headers["x-token-type"] as string;

    if (!clientToken) {
      console.log("❌ No client token provided in headers");
      return res.status(401).json({
        error: "Spotify authentication required",
        details: "Please provide a valid token in x-spotify-token header",
        code: "AUTH_REQUIRED",
      });
    }

    console.log("🔑 Client sent token:", tokenType === "access" ? "access token" : "refresh token");

    // Update the service with the client's token
    if (tokenType === "refresh") {
      console.log("🔄 Updating service with client-provided refresh token");
      spotifyService.updateRefreshToken(clientToken);
    }

    // Try to get a valid access token (will refresh if needed)
    let accessToken: string;
    try {
      console.log("🔄 Getting valid access token...");
      accessToken = await spotifyService.getValidAccessToken();
      console.log("✅ Successfully got access token");

      // Send the new access token back to the client to store in localStorage
      res.setHeader("x-new-access-token", accessToken);
      res.setHeader("x-access-token-expires-in", "3600"); // 1 hour
    } catch (refreshError: any) {
      console.error("❌ Failed to get access token:", refreshError.message);
      return res.status(401).json({
        error: "Failed to get access token",
        details: refreshError.message,
        code: "TOKEN_FAILED",
      });
    }

    // Now fetch the currently playing track
    console.log("🎵 Fetching currently playing track from Spotify...");
    const result = await spotifyService.getCurrentlyPlaying();

    console.log("✅ Successfully fetched currently playing track");
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("❌ Error in now-playing API:", error);

    if (error.message.includes("Invalid refresh token")) {
      return res.status(401).json({
        error: "Invalid refresh token - please re-authenticate with Spotify",
        details: "Your refresh token has expired or is invalid",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    if (error.message.includes("Invalid client credentials")) {
      return res.status(401).json({
        error: "Invalid client credentials",
        details: "Please check your Spotify app configuration",
        code: "INVALID_CLIENT_CREDENTIALS",
      });
    }

    return res.status(500).json({
      error: "Failed to fetch currently playing track",
      details: error.message,
      code: "INTERNAL_ERROR",
    });
  }
}
