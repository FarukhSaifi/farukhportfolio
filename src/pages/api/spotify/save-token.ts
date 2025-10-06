import { MongoClient } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://username:password@cluster.mongodb.net/syncapp?retryWrites=true&w=majority";
const DB_NAME = "syncapp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { access_token, refresh_token, expires_in, token_type } = req.body;

    if (!access_token || !refresh_token) {
      return res.status(400).json({ error: "Access token and refresh token are required" });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection("credentials");

    // Update or insert the token for public user (user_id: 1)
    const result = await collection.findOneAndUpdate(
      { user_id: 5 },
      {
        $set: {
          access_token,
          refresh_token,
          expires_in: expires_in || 3600,
          token_type: token_type || "Bearer",
          is_active: true,
          last_updated: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    await client.close();

    res.status(200).json({
      success: true,
      message: "Spotify token saved successfully",
      data: {
        user_id: 1,
        is_active: true,
        last_updated: new Date(),
      },
    });
  } catch (error: any) {
    console.error("Error saving Spotify token:", error);
    res.status(500).json({
      error: "Failed to save Spotify token",
      details: error.message,
    });
  }
}
