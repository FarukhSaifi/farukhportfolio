interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: Array<{ url: string }> };
  external_urls: { spotify: string };
}

interface CurrentlyPlayingResponse {
  is_playing: boolean;
  item: SpotifyTrack | null;
  progress_ms: number;
  currently_playing_type: string;
  device?: {
    id: string;
    is_active: boolean;
    name: string;
    type: string;
  };
}

export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || "";
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "";
    this.refreshToken =
      "AQBpXUuTXSDp41Fd1PCi0_4SAqvsZbNBPAepMt9pnKaaxBY_hVq8i1YQ3bdxf1KMAvFFFi_VzEXJc_hma4qRC68yYixoFW_5pj08iANAeHi9-TnQvP2ZQ_DYO--znNnG348";

    // Validate required credentials
    if (!this.clientId || !this.clientSecret) {
      console.warn(
        "⚠️ Missing Spotify environment variables: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET"
      );
      console.warn("⚠️ Please create a .env.local file with your Spotify app credentials");
    }
  }

  // Method to get the current access token
  getCurrentAccessToken(): string | null {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    return null;
  }

  // Method to check if we have a valid access token
  hasValidAccessToken(): boolean {
    const token = this.getCurrentAccessToken();
    if (token) {
      console.log("✅ Access token is valid");
      console.log("⏰ Token expires at:", new Date(this.tokenExpiry).toISOString());
      console.log("⏰ Current time:", new Date().toISOString());
      console.log(
        "⏰ Time until expiry:",
        Math.round((this.tokenExpiry - Date.now()) / 1000),
        "seconds"
      );
    } else {
      console.log("❌ No valid access token available");
    }
    return !!token;
  }

  // Method to update the refresh token (useful for client-side updates)
  updateRefreshToken(newToken: string) {
    this.refreshToken = newToken;
    console.log("✅ Refresh token updated in Spotify service");
  }

  // Method to check if we have a valid refresh token
  hasValidRefreshToken(): boolean {
    return !!this.refreshToken && this.refreshToken !== process.env.SPOTIFY_CLIENT_SECRET;
  }

  // Method to get a valid access token (refreshes if needed)
  async getValidAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      return this.refreshAccessToken();
    }
    return this.accessToken;
  }

  private async refreshAccessToken(): Promise<string> {
    try {
      console.log("Refreshing Spotify access token...");

      if (!this.hasValidRefreshToken()) {
        throw new Error("No valid refresh token available - please authenticate with Spotify");
      }

      if (!this.clientId || !this.clientSecret) {
        throw new Error("Missing Spotify client credentials - please check your .env.local file");
      }

      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
            "base64"
          )}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Token refresh failed with status ${response.status}:`, errorText);

        if (response.status === 400) {
          throw new Error("Invalid refresh token - please re-authenticate with Spotify");
        } else if (response.status === 401) {
          throw new Error("Invalid client credentials");
        } else {
          throw new Error(`Token refresh failed: ${response.statusText} (${response.status})`);
        }
      }

      const data: SpotifyTokens = await response.json();

      if (!data.access_token) {
        throw new Error("No access token received from Spotify");
      }

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;

      console.log("✅ Access token refreshed successfully");
      console.log("🔑 New access token:", this.accessToken);
      console.log("⏰ Token expires at:", new Date(this.tokenExpiry).toISOString());

      return this.accessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  }

  async getCurrentlyPlaying(): Promise<{
    isPlaying: boolean;
    track: {
      title: string;
      artist: string;
      album: string;
      imageUrl: string;
      songUrl: string;
    } | null;
  }> {
    try {
      const accessToken = await this.getValidAccessToken();
      console.log("🔑 Using access token for API call:", accessToken.substring(0, 20) + "...");

      console.log("Fetching currently playing track from Spotify...");

      const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Handle different response statuses according to Spotify API docs
      if (response.status === 204) {
        // No content - user not playing anything
        console.log("No currently playing track (status 204)");
        return { isPlaying: false, track: null };
      }

      if (response.status === 401) {
        // Unauthorized - token might be expired
        console.log("Token expired, refreshing...");
        this.accessToken = null; // Force token refresh
        const newToken = await this.getValidAccessToken();

        // Retry with new token
        const retryResponse = await fetch(
          "https://api.spotify.com/v1/me/player/currently-playing",
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          }
        );

        if (retryResponse.status === 204) {
          return { isPlaying: false, track: null };
        }

        if (!retryResponse.ok) {
          throw new Error(
            `Spotify API error: ${retryResponse.statusText} (${retryResponse.status})`
          );
        }

        const data: CurrentlyPlayingResponse = await retryResponse.json();
        return this.parseCurrentlyPlayingResponse(data);
      }

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.statusText} (${response.status})`);
      }

      const data: CurrentlyPlayingResponse = await response.json();
      return this.parseCurrentlyPlayingResponse(data);
    } catch (error) {
      console.error("Error fetching currently playing:", error);
      throw error;
    }
  }

  private parseCurrentlyPlayingResponse(data: CurrentlyPlayingResponse) {
    if (!data.is_playing || !data.item) {
      return { isPlaying: false, track: null };
    }

    const track = data.item;
    return {
      isPlaying: true,
      track: {
        title: track.name,
        artist: track.artists.map((a) => a.name).join(", "),
        album: track.album.name,
        imageUrl: track.album.images[0]?.url || "",
        songUrl: track.external_urls.spotify,
      },
    };
  }

  async getRecentlyPlayed(limit: number = 5): Promise<
    Array<{
      title: string;
      artist: string;
      album: string;
      imageUrl: string;
      songUrl: string;
      playedAt: string;
    }>
  > {
    try {
      const accessToken = await this.getValidAccessToken();

      const response = await fetch(
        `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.statusText}`);
      }

      const data = await response.json();

      return data.items.map((item: any) => ({
        title: item.track.name,
        artist: item.track.artists.map((a: any) => a.name).join(", "),
        album: item.track.album.name,
        imageUrl: item.track.album.images[0]?.url || "",
        songUrl: item.track.external_urls.spotify,
        playedAt: item.played_at,
      }));
    } catch (error) {
      console.error("Error fetching recently played:", error);
      throw new Error("Failed to fetch recently played tracks");
    }
  }
}

export const spotifyService = new SpotifyService();
