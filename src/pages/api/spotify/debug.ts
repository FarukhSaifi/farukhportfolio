import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check environment variables
    const envCheck = {
      clientId: !!process.env.SPOTIFY_CLIENT_ID,
      clientSecret: !!process.env.SPOTIFY_CLIENT_SECRET,
      refreshToken: !!process.env.SPOTIFY_REFRESH_TOKEN,
      refreshTokenLength: process.env.SPOTIFY_REFRESH_TOKEN?.length || 0,
    };

    // Test token refresh
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      return res.status(500).json({
        error: "Missing environment variables",
        envCheck,
      });
    }

    // Test token refresh
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      return res.status(500).json({
        error: "Token refresh failed",
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorData,
        envCheck,
      });
    }

    const tokens = await tokenResponse.json();

    // Test currently playing endpoint
    const currentlyPlayingResponse = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const currentlyPlayingData = await currentlyPlayingResponse.json();

    return res.status(200).json({
      success: true,
      envCheck,
      tokenRefresh: {
        success: true,
        expiresIn: tokens.expires_in,
        tokenType: tokens.token_type,
      },
      currentlyPlaying: {
        status: currentlyPlayingResponse.status,
        statusText: currentlyPlayingResponse.statusText,
        data: currentlyPlayingData,
      },
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return res.status(500).json({
      error: "Debug endpoint failed",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
