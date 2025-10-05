import { spotifyService } from "@/lib/spotify";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice("Bearer ".length)
      : undefined;
    const clientHeaderToken = (req.headers["x-spotify-token"] as string) || undefined;
    const tokenType = (req.headers["x-token-type"] as string) || (bearer ? "access" : undefined);

    const providedToken = bearer || clientHeaderToken;

    if (providedToken && tokenType === "access") {
      spotifyService.setAccessToken(providedToken, 3600);
    } else if (providedToken && tokenType === "refresh") {
      spotifyService.updateRefreshToken(providedToken);
    } else if (!providedToken) {
      if (!process.env.SPOTIFY_REFRESH_TOKEN) {
        return res.status(401).json({
          error: "Spotify authentication required",
          details:
            "Provide Authorization: Bearer <access_token> or x-spotify-token (refresh) header, or set SPOTIFY_REFRESH_TOKEN on server",
          code: "AUTH_REQUIRED",
        });
      }
    }

    let accessToken: string;
    try {
      accessToken = await spotifyService.getValidAccessToken();
      res.setHeader("x-new-access-token", accessToken);
      res.setHeader("x-access-token-expires-in", "3600");
    } catch (refreshError: any) {
      return res.status(401).json({
        error: "Failed to get access token",
        details: refreshError.message,
        code: "TOKEN_FAILED",
      });
    }

    const market = typeof req.query.market === "string" ? req.query.market : undefined;
    const additionalTypes = typeof req.query.additional_types === "string" ? req.query.additional_types : undefined;

    const result = await spotifyService.getCurrentlyPlaying({ market, additionalTypes });
    return res.status(200).json(result);
  } catch (error: any) {
    if (typeof error.message === "string" && error.message.includes("Invalid refresh token")) {
      return res.status(401).json({
        error: "Invalid refresh token - please re-authenticate with Spotify",
        details: "Your refresh token has expired or is invalid",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    if (typeof error.message === "string" && error.message.includes("Invalid client credentials")) {
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
