import { createHash, randomBytes } from "crypto";
import { ERROR_MESSAGES, HTTP_STATUS, SPOTIFY_CONFIG } from "./constants";
import type { AppError } from "./interfaces";

/**
 * API Utilities
 *
 * Provides standardized API response creation and error handling.
 * Used across all API routes for consistent response formatting.
 */
export class ApiUtils {
  /**
   * Create standardized success response
   *
   * @param {T} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   * @returns {object} Standardized success response
   */
  static createSuccessResponse<T>(data: T, message: string = "Success", statusCode: number = HTTP_STATUS.OK): any {
    return { success: true, data, message, statusCode };
  }

  /**
   * Create standardized error response
   *
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {any} details - Additional error details
   * @returns {object} Standardized error response
   */
  static createErrorResponse(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: any,
  ): any {
    return { success: false, error: message, statusCode, data: details };
  }

  /**
   * Handle and standardize API errors
   *
   * @param {any} error - Error to handle
   * @returns {AppError} Standardized error object
   */
  static handleApiError(error: any): AppError {
    if (error instanceof Error) {
      return {
        code: "API_ERROR",
        message: error.message,
        timestamp: new Date(),
        details: error,
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: ERROR_MESSAGES.GENERAL.UNKNOWN_ERROR,
      details: error,
      timestamp: new Date(),
    };
  }
}

/**
 * Spotify Utilities (Server-side)
 *
 * Provides Spotify API integration utilities for server-side operations.
 * Handles token management, response parsing, and API interactions.
 */
export class SpotifyUtils {
  /**
   * Parse Spotify currently playing response
   *
   * @param {any} data - Raw Spotify API response
   * @returns {object} Parsed currently playing data
   */
  static parseCurrentlyPlayingResponse(data: any) {
    if (!data.is_playing || !data.item) {
      return { isPlaying: false, isLastPlayed: false, track: null };
    }

    const item = data.item;

    // Tracks vs podcast episodes have different shapes
    if (item.type === "episode" || (!item.artists && item.show)) {
      return {
        isPlaying: true,
        isLastPlayed: false,
        track: {
          title: item.name || "Unknown episode",
          artist: item.show?.publisher || item.show?.name || "Podcast",
          album: item.show?.name || "",
          imageUrl: item.images?.[0]?.url || item.show?.images?.[0]?.url || "",
          songUrl: item.external_urls?.spotify || "",
        },
      };
    }

    return {
      isPlaying: true,
      isLastPlayed: false,
      track: {
        title: item.name || SPOTIFY_CONFIG.UNKNOWN_TRACK,
        artist: Array.isArray(item.artists)
          ? item.artists
              .map((a: { name?: string }) => a.name)
              .filter(Boolean)
              .join(", ")
          : SPOTIFY_CONFIG.UNKNOWN_ARTIST,
        album: item.album?.name || "",
        imageUrl: item.album?.images?.[0]?.url || "",
        songUrl: item.external_urls?.spotify || "",
      },
    };
  }

  /**
   * Check if token is expired
   *
   * @param {number} expiry - Token expiry timestamp
   * @returns {boolean} True if token is expired
   */
  static isTokenExpired(expiry: number): boolean {
    return Date.now() >= expiry;
  }

  /**
   * Check if token is about to expire
   *
   * @param {number} expiry - Token expiry timestamp
   * @param {number} bufferMinutes - Buffer time in minutes
   * @returns {boolean} True if token is about to expire
   */
  static isTokenAboutToExpire(expiry: number, bufferMinutes: number = 5): boolean {
    const bufferMs = bufferMinutes * 60 * 1000;
    return Date.now() >= expiry - bufferMs;
  }

  /**
   * Get Spotify redirect URI based on environment
   * Prefer SPOTIFY_REDIRECT_URI when set (exact Dashboard match).
   */
  static getRedirectUri(): string {
    const override = process.env.SPOTIFY_REDIRECT_URI?.trim();
    if (override) return override;

    return EnvironmentUtils.isProduction()
      ? SPOTIFY_CONFIG.REDIRECT_URI.PRODUCTION
      : SPOTIFY_CONFIG.REDIRECT_URI.DEVELOPMENT;
  }

  /**
   * Generate a PKCE code_verifier (43–128 chars).
   */
  static generateCodeVerifier(length: number = SPOTIFY_CONFIG.PKCE_VERIFIER_LENGTH): string {
    return randomBytes(length).toString("base64url").slice(0, length);
  }

  /**
   * Generate a random OAuth state value.
   */
  static generateOAuthState(): string {
    return randomBytes(SPOTIFY_CONFIG.OAUTH_STATE_BYTES).toString("hex");
  }

  /**
   * Create S256 code_challenge from a code_verifier.
   */
  static createCodeChallenge(verifier: string): string {
    return createHash("sha256").update(verifier).digest("base64url");
  }

  /**
   * Refresh Spotify access token using refresh token
   *
   * @param {string} refreshToken - Spotify refresh token
   * @returns {Promise<object|null>} Refreshed token data or null if failed
   */
  static async refreshSpotifyToken(refreshToken: string): Promise<{
    access_token: string;
    expires_in: number;
    token_type: string;
  } | null> {
    try {
      const response = await fetch(SPOTIFY_CONFIG.AUTH_BASE_URL, {
        method: "POST",
        headers: {
          [SPOTIFY_CONFIG.HEADERS.CONTENT_TYPE]: SPOTIFY_CONFIG.HEADERS.FORM_URLENCODED,
          [SPOTIFY_CONFIG.HEADERS.AUTHORIZATION]: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: SPOTIFY_CONFIG.GRANT_TYPE.REFRESH_TOKEN,
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        console.error("Failed to refresh Spotify token:", response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      return {
        access_token: data.access_token,
        expires_in: data.expires_in,
        token_type: data.token_type || SPOTIFY_CONFIG.DEFAULT_TOKEN_TYPE,
      };
    } catch (error) {
      console.error("Error refreshing Spotify token:", error);
      return null;
    }
  }
}

/**
 * Environment Utilities
 *
 * Provides environment variable access and environment-specific logic.
 * Handles configuration management and environment detection.
 */
export class EnvironmentUtils {
  /**
   * Check if running in production mode
   *
   * @returns {boolean} True if in production
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }

  /**
   * Get Spotify client ID from environment
   *
   * @returns {string} Spotify client ID
   * @throws {Error} If client ID is not configured
   */
  static getSpotifyClientId(): string {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    if (!clientId) {
      throw new Error("SPOTIFY_CLIENT_ID environment variable is required");
    }
    return clientId;
  }

  /**
   * Get Spotify client secret from environment
   *
   * @returns {string} Spotify client secret
   * @throws {Error} If client secret is not configured
   */
  static getSpotifyClientSecret(): string {
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientSecret) {
      throw new Error("SPOTIFY_CLIENT_SECRET environment variable is required");
    }
    return clientSecret;
  }

  /**
   * Get MongoDB URI from environment
   *
   * @returns {string} MongoDB URI
   * @throws {Error} If MongoDB URI is not configured
   */
  static getMongodbUri(): string {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is required");
    }
    return uri;
  }
}
