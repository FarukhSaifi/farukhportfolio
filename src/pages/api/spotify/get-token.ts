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

    await client.close();

    if (!token) {
      return res.status(404).json({
        success: false,
        error: "No active Spotify token found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_in: token.expires_in,
        token_type: token.token_type,
        last_updated: token.last_updated,
      },
    });
  } catch (error: any) {
    console.error("Error getting Spotify token:", error);
    res.status(500).json({
      error: "Failed to get Spotify token",
      details: error.message,
    });
  }
}
