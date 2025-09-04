// Client-side utility for managing Spotify tokens
export class SpotifyClient {
  private static STORAGE_KEY = "spotify_refresh_token";
  private static ACCESS_TOKEN_KEY = "spotify_access_token";
  private static ACCESS_TOKEN_EXPIRY_KEY = "spotify_access_token_expiry";

  // Refresh Token Methods
  static getStoredToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  }

  static storeToken(token: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(this.STORAGE_KEY, token);
      console.log("✅ Refresh token stored in localStorage");
      console.log("🔑 Token value stored:", token);
    } catch (error) {
      console.error("Error storing refresh token in localStorage:", error);
    }
  }

  static clearToken(): void {
    if (typeof window === "undefined") return;
    try {
      const currentToken = localStorage.getItem(this.STORAGE_KEY);
      if (currentToken) {
        console.log("🗑️ Clearing refresh token from localStorage");
        console.log("🔑 Token being cleared:", currentToken);
      }
      localStorage.removeItem(this.STORAGE_KEY);
      console.log("🗑️ Refresh token cleared from localStorage");
    } catch (error) {
      console.error("Error clearing refresh token from localStorage:", error);
    }
  }

  static hasToken(): boolean {
    const token = this.getStoredToken();
    const hasToken = !!token;
    console.log("🔍 Refresh token check:", hasToken ? "✅ Found" : "❌ Not found");
    if (token) {
      console.log("🔑 Current refresh token value:", token);
    }
    return hasToken;
  }

  // Access Token Methods
  static getStoredAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  }

  static getStoredAccessTokenExpiry(): number | null {
    if (typeof window === "undefined") return null;
    try {
      const expiry = localStorage.getItem(this.ACCESS_TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry) : null;
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  }

  static storeAccessToken(token: string, expiresIn: number = 3600): void {
    if (typeof window === "undefined") return;
    try {
      const expiry = Date.now() + expiresIn * 1000;
      console.log("💾 Storing access token in localStorage");
      console.log("⏰ Token expires at:", new Date(expiry).toISOString());
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      localStorage.setItem(this.ACCESS_TOKEN_EXPIRY_KEY, expiry.toString());
    } catch (error) {
      console.error("Error storing access token in localStorage:", error);
    }
  }

  static clearAccessToken(): void {
    if (typeof window === "undefined") return;
    try {
      console.log("🗑️ Clearing access token from localStorage");
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.ACCESS_TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error("Error clearing access token from localStorage:", error);
    }
  }

  static hasValidAccessToken(): boolean {
    if (typeof window === "undefined") return false;
    try {
      const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      const expiry = localStorage.getItem(this.ACCESS_TOKEN_EXPIRY_KEY);

      if (!token || !expiry) return false;

      const isValid = Date.now() < parseInt(expiry);
      console.log("🔍 Access token validation:", {
        hasToken: !!token,
        isValid,
        expiresAt: new Date(parseInt(expiry)).toISOString(),
      });

      return isValid;
    } catch (error) {
      console.error("Error checking access token validity:", error);
      return false;
    }
  }

  static getValidAccessToken(): string | null {
    if (this.hasValidAccessToken()) {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  static clearAllTokens(): void {
    this.clearToken();
    this.clearAccessToken();
    console.log("🗑️ All Spotify tokens cleared from localStorage");
  }

  // Get token for API calls (prioritizes access token, then refresh token)
  static getTokenForAPI(): string | null {
    // First try to get a valid access token
    const accessToken = this.getValidAccessToken();
    if (accessToken) {
      console.log("🔑 Using stored access token for API call");
      return accessToken;
    }

    // Fallback to refresh token
    const refreshToken = this.getStoredToken();
    if (refreshToken) {
      console.log("🔄 No valid access token, using refresh token for API call");
      return refreshToken;
    }

    console.log("❌ No tokens available for API call");
    return null;
  }

  // Update refresh token
  static updateToken(newToken: string): void {
    console.log("🔄 Updating refresh token");
    console.log("🔑 New refresh token value:", newToken);
    this.storeToken(newToken);
  }

  // Update access token
  static updateAccessToken(newToken: string, expiresIn: number = 3600): void {
    console.log("🔄 Updating access token");
    console.log("🔑 New access token value:", newToken);
    this.storeAccessToken(newToken, expiresIn);
  }

  // Make authenticated API call with automatic token management
  static async makeAuthenticatedCall(endpoint: string): Promise<any> {
    console.log("🌐 Making authenticated API call to:", endpoint);

    // First try with access token
    const accessToken = this.getValidAccessToken();
    if (accessToken) {
      console.log("🔑 Using access token for API call");
      try {
        const response = await fetch(endpoint, {
          headers: {
            "x-spotify-token": accessToken,
            "x-token-type": "access",
          },
        });

        if (!response.ok) {
          throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("✅ API call successful with access token");
        return data;
      } catch (error) {
        console.log("❌ API call with access token failed, trying refresh token...");
        // Continue to refresh token fallback
      }
    }

    // Fallback to refresh token
    const refreshToken = this.getStoredToken();
    if (!refreshToken) {
      throw new Error("No Spotify tokens available");
    }

    console.log("🔄 Using refresh token for API call");
    const response = await fetch(endpoint, {
      headers: {
        "x-spotify-token": refreshToken,
        "x-token-type": "refresh",
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ API call successful with refresh token");
    return data;
  }

  // Get comprehensive token information
  static getTokenInfo(): {
    hasRefreshToken: boolean;
    hasAccessToken: boolean;
    accessTokenExpiry: string | null;
    refreshTokenLength: number;
    accessTokenLength: number;
    refreshTokenPreview: string;
    accessTokenPreview: string;
  } {
    try {
      const refreshToken = this.getStoredToken();
      const accessToken = this.getStoredAccessToken();
      const accessTokenExpiry = localStorage.getItem(this.ACCESS_TOKEN_EXPIRY_KEY);

      return {
        hasRefreshToken: !!refreshToken,
        hasAccessToken: !!accessToken,
        accessTokenExpiry: accessTokenExpiry
          ? new Date(parseInt(accessTokenExpiry)).toISOString()
          : null,
        refreshTokenLength: refreshToken?.length || 0,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenPreview: refreshToken ? `${refreshToken.substring(0, 20)}...` : "None",
        accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : "None",
      };
    } catch (error) {
      console.error("Error getting token info:", error);
      return {
        hasRefreshToken: false,
        hasAccessToken: false,
        accessTokenExpiry: null,
        refreshTokenLength: 0,
        accessTokenLength: 0,
        refreshTokenPreview: "Error",
        accessTokenPreview: "Error",
      };
    }
  }
}
