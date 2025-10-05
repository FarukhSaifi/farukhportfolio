import { NextApiRequest, NextApiResponse } from "next";

const REDIRECT_URI =
  process.env.NODE_ENV === "production"
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/spotify-success`
    : "http://localhost:3000/spotify-success";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: "Spotify client credentials not configured" });
    }

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("❌ Spotify token exchange failed:", errorData);
      return res.status(400).json({
        error: "Failed to exchange authorization code",
        details: errorData,
      });
    }

    const tokenData = await tokenResponse.json();
    console.log("✅ Successfully exchanged code for tokens");
    console.log("🔑 Access token received:", tokenData.access_token ? "Yes" : "No");
    console.log("🔄 Refresh token received:", tokenData.refresh_token ? "Yes" : "No");
    console.log("⏰ Expires in:", tokenData.expires_in, "seconds");

    // Return the tokens to the client
    return res.status(200).json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    });
  } catch (error: any) {
    console.error("❌ Error in token exchange:", error);
    return res.status(500).json({
      error: "Internal server error during token exchange",
      details: error.message,
    });
  }
}
