import { NextApiRequest, NextApiResponse } from "next";
import querystring from "querystring";

const {
  SPOTIFY_CLIENT_ID: clientId,
  SPOTIFY_CLIENT_SECRET: clientSecret,
  SPOTIFY_REFRESH_TOKEN: refreshToken,
} = process.env;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const CURRENTLY_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";

// Function to refresh the access token
const refreshAccessToken = async (): Promise<string> => {
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: querystring.stringify({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("Failed to refresh access token");
  }

  return data.access_token;
};

// Function to fetch the currently playing track
const fetchCurrentlyPlaying = async (accessToken: string) => {
  const response = await fetch(CURRENTLY_PLAYING_ENDPOINT, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch currently playing track");
  }

  const data = await response.json();

  // Handle cases where no song is currently playing
  if (!data.item) {
    return { isPlaying: false };
  }

  // Extract relevant information from the response
  const track = {
    isPlaying: data.is_playing,
    title: data.item.name,
    artist: data.item.artists
      .map((artist: { name: string }) => artist.name)
      .join(", "),
    album: data.item.album.name,
    albumImageUrl: data.item.album.images[0].url,
    songUrl: data.item.external_urls.spotify,
  };

  return track;
};

export default async (_: NextApiRequest, res: NextApiResponse) => {
  try {
    // Step 1: Refresh the access token
    const accessToken = await refreshAccessToken();

    // Step 2: Fetch the currently playing track
    const track = await fetchCurrentlyPlaying(accessToken);

    res.status(200).json(track);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Failed to fetch currently playing track" });
  }
};
