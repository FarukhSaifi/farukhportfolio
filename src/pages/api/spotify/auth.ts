import { NextApiRequest, NextApiResponse } from "next";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  process.env.NODE_ENV === "production"
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/about`
    : "http://localhost:3000/about";

const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-read-recently-played",
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!SPOTIFY_CLIENT_ID) {
    return res.status(500).json({ error: "Spotify client ID not configured" });
  }

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.set("client_id", SPOTIFY_CLIENT_ID);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("scope", SCOPES.join(" "));
  authUrl.searchParams.set("show_dialog", "true");

  res.redirect(authUrl.toString());
}
