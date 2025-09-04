"use client";

import { useSpotify } from "@/contexts/SpotifyContext";
import { useEffect, useState } from "react";

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: Array<{ url: string }> };
  external_urls: { spotify: string };
}

interface NowPlayingData {
  isPlaying: boolean;
  track: SpotifyTrack | null;
  progressMs: number;
  timestamp: number;
}

export default function NowPlaying() {
  const [nowPlaying, setNowPlaying] = useState<NowPlayingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { hasRefreshToken, getTokenForAPI, updateAccessToken } = useSpotify();

  const fetchNowPlaying = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🎵 NowPlaying: Fetching current track...");

      // Check if we have a stored refresh token
      if (!hasRefreshToken()) {
        console.log("❌ NowPlaying: No Spotify token available");
        setError("No Spotify token available. Please authenticate first.");
        return;
      }

      console.log("✅ NowPlaying: Token available, making API call...");

      // Make authenticated API call
      const data = await fetch("/api/spotify/now-playing", {
        headers: {
          "x-spotify-token": getTokenForAPI() || "",
          "x-token-type": "refresh",
        },
      });

      if (!data.ok) {
        throw new Error(`API call failed: ${data.status}`);
      }

      const result = await data.json();
      console.log("✅ NowPlaying: API call successful:", result);
      setNowPlaying(result);

      // Check if we received a new access token from the API
      const newAccessToken = data.headers.get("x-new-access-token");
      const expiresIn = data.headers.get("x-access-token-expires-in");

      if (newAccessToken && expiresIn) {
        console.log("🔑 NowPlaying: Received new access token from API");
        updateAccessToken(newAccessToken, parseInt(expiresIn));
      }
    } catch (error: any) {
      console.error("❌ NowPlaying: Error fetching track:", error);
      setError(error.message || "Failed to fetch currently playing track");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchNowPlaying();

    // Then poll every 30 seconds
    const interval = setInterval(fetchNowPlaying, 30000);

    return () => clearInterval(interval);
  }, [hasRefreshToken, getTokenForAPI, updateAccessToken]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span>Loading Spotify...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-500">
        <span>⚠️ Spotify: {error}</span>
        <button
          onClick={() => (window.location.href = "/spotify-auth")}
          className="text-blue-500 hover:underline"
        >
          Reconnect
        </button>
      </div>
    );
  }

  if (!nowPlaying || !nowPlaying.isPlaying || !nowPlaying.track) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>🎵 Not playing</span>
      </div>
    );
  }

  const { track } = nowPlaying;

  return (
    <div className="flex items-center space-x-3 bg-gray-800 bg-opacity-50 rounded-lg px-3 py-2">
      {/* Album Art */}
      {track.album.images[0] && (
        <img
          src={track.album.images[0].url}
          alt={`${track.album.name} cover`}
          className="w-8 h-8 rounded"
        />
      )}

      {/* Track Info */}
      <div className="flex flex-col min-w-0">
        <a
          href={track.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-white hover:underline truncate"
        >
          {track.name}
        </a>
        <span className="text-xs text-gray-400 truncate">
          {track.artists.map((artist) => artist.name).join(", ")}
        </span>
      </div>

      {/* Playing Indicator */}
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
        <div
          className="w-1 h-1 bg-green-400 rounded-full animate-pulse"
          style={{ animationDelay: "0.2s" }}
        ></div>
        <div
          className="w-1 h-1 bg-green-400 rounded-full animate-pulse"
          style={{ animationDelay: "0.4s" }}
        ></div>
      </div>
    </div>
  );
}
