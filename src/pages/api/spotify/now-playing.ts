import { spotifyService } from "@/lib/spotify";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const data = await spotifyService.getCurrentlyPlaying();

    // Cache for 30 seconds to avoid hitting Spotify API too frequently
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate");

    return res.status(200).json(data);
  } catch (error) {
    console.error("Spotify API error:", error);

    if (error instanceof Error) {
      return res.status(500).json({
        error: "Failed to fetch Spotify data",
        details: error.message,
      });
    }

    return res.status(500).json({
      error: "Failed to fetch Spotify data",
    });
  }
}
