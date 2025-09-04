import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID ? "✅ Set" : "❌ Missing",
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET ? "✅ Set" : "❌ Missing",
    spotifyRefreshToken: process.env.SPOTIFY_REFRESH_TOKEN ? "✅ Set" : "❌ Missing",
    redirectUri:
      process.env.NODE_ENV === "production"
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/spotify-success`
        : "http://localhost:3000/spotify-success",
    headers: {
      origin: req.headers.origin,
      host: req.headers.host,
      referer: req.headers.referer,
    },
    query: req.query,
  };

  res.status(200).json(debugInfo);
}
