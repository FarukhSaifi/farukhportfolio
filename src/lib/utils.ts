import { ERROR_MESSAGES, HTTP_STATUS } from "./constants";
import { AppError } from "./types";

/**
 * API Utilities (Client-side)
 *
 * Provides standardized API response creation and error handling for client-side usage.
 * This is a simplified version of the server-side ApiUtils.
 */
export class ApiUtils {
  /**
   * Create standardized success response
   *
   * @param {T} data - Response data
   * @param {string} message - Success message
   * @returns {object} Standardized success response
   */
  static createSuccessResponse<T>(data: T, message?: string) {
    return {
      success: true,
      data,
      message,
    };
  }

  /**
   * Create standardized error response
   *
   * @param {string} error - Error message
   * @param {number} statusCode - HTTP status code
   * @returns {object} Standardized error response
   */
  static createErrorResponse(error: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    return {
      success: false,
      error,
      statusCode,
    };
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
 * Client-side Spotify Utilities
 *
 * Provides Spotify token management utilities for client-side usage.
 * Handles token expiry checks and calculations.
 */
export class ClientSpotifyUtils {
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
}
