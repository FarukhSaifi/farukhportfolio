import { NextApiRequest, NextApiResponse } from "next";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, error } = req.query;

  if (error) {
    console.error("Spotify authorization error:", error);
    return res.redirect("/spotify-auth?error=auth_failed");
  }

  if (!code || typeof code !== "string") {
    return res.redirect("/spotify-auth?error=no_code");
  }

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri =
      process.env.NODE_ENV === "production"
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/about`
        : "http://localhost:3000/about";

    if (!clientId || !clientSecret) {
      throw new Error("Missing Spotify credentials");
    }

    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`);
    }

    const tokens: TokenResponse = await tokenResponse.json();

    console.log("✅ Spotify authorization successful!");
    console.log("Refresh token:", tokens.refresh_token);
    console.log("Access token expires in:", tokens.expires_in, "seconds");

    // Redirect to about page with success message and refresh token
    const aboutUrl = new URL("/about", req.headers.origin || "http://localhost:3000");
    aboutUrl.searchParams.set("spotify", "success");
    aboutUrl.searchParams.set("token", tokens.refresh_token);

    res.redirect(aboutUrl.toString());
  } catch (error) {
    console.error("Error in Spotify callback:", error);

    const errorUrl = new URL("/about", req.headers.origin || "http://localhost:3000");
    errorUrl.searchParams.set("spotify", "error");
    errorUrl.searchParams.set("message", error instanceof Error ? error.message : "Unknown error");

    res.redirect(errorUrl.toString());
  }
}
