import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    console.log("🔄 Exchanging authorization code for tokens...");
    console.log("🔑 Code received:", code.substring(0, 20) + "...");

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: "http://localhost:3000/spotify-success",
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
