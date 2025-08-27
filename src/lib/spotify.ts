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
}

class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private refreshToken: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID!;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
    this.refreshToken = process.env.SPOTIFY_REFRESH_TOKEN!;

    if (!this.clientId || !this.clientSecret || !this.refreshToken) {
      throw new Error("Missing required Spotify environment variables");
    }
  }

  private async refreshAccessToken(): Promise<string> {
    try {
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
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const data: SpotifyTokens = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;

      return this.accessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw new Error("Failed to refresh Spotify access token");
    }
  }

  private async getValidAccessToken(): Promise<string> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      return this.refreshAccessToken();
    }
    return this.accessToken;
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

      const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 204) {
          // No content - user not playing anything
          return { isPlaying: false, track: null };
        }
        throw new Error(`Spotify API error: ${response.statusText}`);
      }

      const data: CurrentlyPlayingResponse = await response.json();

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
    } catch (error) {
      console.error("Error fetching currently playing:", error);
      throw new Error("Failed to fetch currently playing track");
    }
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
