import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/syncapp?retryWrites=true&w=majority";
const DB_NAME = "syncapp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection("credentials");

    // Get the public user's token (user_id: 5)
    const token = await collection.findOne({ user_id: 5, is_active: true });

    if (!token) {
      await client.close();
      return res.status(404).json({
        success: false,
        error: "No active Spotify token found",
      });
    }

    // Get current playing track from Spotify API
    const spotifyResponse = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!spotifyResponse.ok) {
      await client.close();
      return res.status(spotifyResponse.status).json({
        success: false,
        error: "Failed to get current playing track from Spotify",
        details: await spotifyResponse.text(),
      });
    }

    const spotifyData = await spotifyResponse.json();

    await client.close();

    res.status(200).json({
      success: true,
      data: {
        isPlaying: spotifyData.is_playing || false,
        track: spotifyData.item
          ? {
              title: spotifyData.item.name,
              artist: spotifyData.item.artists.map((artist: any) => artist.name).join(", "),
              album: spotifyData.item.album.name,
              imageUrl: spotifyData.item.album.images[0]?.url,
              songUrl: spotifyData.item.external_urls.spotify,
            }
          : null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error getting public now playing:", error);
    res.status(500).json({
      error: "Failed to get public now playing",
      details: error.message,
    });
  }
}
