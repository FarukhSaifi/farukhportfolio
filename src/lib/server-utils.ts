import { ERROR_MESSAGES, HTTP_STATUS } from "./constants";
import { AppError } from "./types";

/**
 * Database Utilities (Server-side only)
 *
 * Provides MongoDB connection management and collection access.
 * This class is deprecated in favor of the DatabaseService singleton.
 *
 * @deprecated Use DatabaseService instead
 */
export class DatabaseUtils {
  private static client: any = null;

  /**
   * Get MongoDB client connection
   *
   * @returns {Promise<any>} MongoDB client
   * @deprecated Use DatabaseService instead
   */
  static async getClient() {
    if (!this.client) {
      const { MongoClient } = await import("mongodb");
      const uri =
        process.env.MONGODB_URI ||
        "mongodb+srv://username:password@cluster.mongodb.net/syncapp?retryWrites=true&w=majority";
      this.client = new MongoClient(uri);
      await this.client.connect();
    }
    return this.client;
  }

  /**
   * Close MongoDB connection
   *
   * @returns {Promise<void>} Connection close promise
   * @deprecated Use DatabaseService instead
   */
  static async closeConnection() {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
  }

  /**
   * Get MongoDB collection
   *
   * @param {string} name - Collection name
   * @returns {Promise<any>} MongoDB collection
   * @deprecated Use DatabaseService instead
   */
  static async getCollection(name: string) {
    const client = await this.getClient();
    const db = client.db("syncapp");
    return db.collection(name);
  }
}

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
    details?: any
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
      return { isPlaying: false, track: null };
    }

    const track = data.item;
    return {
      isPlaying: true,
      track: {
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(", "),
        album: track.album.name,
        imageUrl: track.album.images[0]?.url || "",
        songUrl: track.external_urls.spotify,
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
   * Calculate token expiry timestamp
   *
   * @param {number} expiresIn - Token expires in seconds
   * @returns {number} Expiry timestamp
   */
  static calculateTokenExpiry(expiresIn: number): number {
    return Date.now() + expiresIn * 1000;
  }

  /**
   * Get Spotify redirect URI based on environment
   *
   * @returns {string} Redirect URI
   */
  static getRedirectUri(): string {
    return process.env.NODE_ENV === "production"
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/spotify-success`
      : "http://localhost:3000/spotify-success";
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
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
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
        token_type: data.token_type || "Bearer",
      };
    } catch (error) {
      console.error("Error refreshing Spotify token:", error);
      return null;
    }
  }
}

/**
 * Validation Utilities
 *
 * Provides input validation functions for various data types.
 * Used for sanitizing and validating user inputs and API data.
 */
export class ValidationUtils {
  /**
   * Validate Spotify token format
   *
   * @param {string} token - Token to validate
   * @returns {boolean} True if token is valid
   */
  static isValidSpotifyToken(token: string): boolean {
    return typeof token === "string" && token.length > 0;
  }

  /**
   * Validate email format
   *
   * @param {string} email - Email to validate
   * @returns {boolean} True if email is valid
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   *
   * @param {string} password - Password to validate
   * @returns {boolean} True if password meets requirements
   */
  static isValidPassword(password: string): boolean {
    return password.length >= 6; // Minimum 6 characters
  }
}

/**
 * Performance Utilities
 *
 * Provides performance optimization functions like debouncing and throttling.
 * Used to optimize API calls and user interactions.
 */
export class PerformanceUtils {
  /**
   * Debounce function execution
   *
   * @param {T} func - Function to debounce
   * @param {number} delay - Delay in milliseconds
   * @returns {Function} Debounced function
   */
  static debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle function execution
   *
   * @param {T} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  static throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
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
   * Check if running in development mode
   *
   * @returns {boolean} True if in development
   */
  static isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  }

  /**
   * Check if running in production mode
   *
   * @returns {boolean} True if in production
   */
  static isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }

  /**
   * Get application base URL
   *
   * @returns {string} Base URL
   */
  static getBaseUrl(): string {
    return process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000";
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

/**
 * Date Utilities
 *
 * Provides date formatting and manipulation functions.
 * Used for displaying dates and checking token expiry.
 */
export class DateUtils {
  /**
   * Format date with optional relative time
   *
   * @param {string | Date} date - Date to format
   * @param {boolean} includeRelative - Include relative time
   * @returns {string} Formatted date string
   */
  static formatDate(date: string | Date, includeRelative = false): string {
    const dateObj = typeof date === "string" ? new Date(date) : date;

    if (includeRelative) {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

      if (diffInSeconds < 60) return "just now";
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Check if token is expired
   *
   * @param {number} expiryTimestamp - Token expiry timestamp
   * @returns {boolean} True if token is expired
   */
  static isTokenExpired(expiryTimestamp: number): boolean {
    return Date.now() >= expiryTimestamp;
  }
}

/**
 * String Utilities
 *
 * Provides string manipulation and formatting functions.
 * Used for text processing and ID generation.
 */
export class StringUtils {
  /**
   * Truncate string to specified length
   *
   * @param {string} str - String to truncate
   * @param {number} length - Maximum length
   * @param {string} suffix - Suffix to add
   * @returns {string} Truncated string
   */
  static truncate(str: string, length: number, suffix = "..."): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Convert string to URL-friendly slug
   *
   * @param {string} str - String to slugify
   * @returns {string} URL-friendly slug
   */
  static slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * Generate random ID string
   *
   * @param {number} length - ID length
   * @returns {string} Random ID string
   */
  static generateId(length = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
