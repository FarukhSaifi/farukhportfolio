// API Endpoints
export const API_ENDPOINTS = {
  SPOTIFY: {
    AUTH: "/api/spotify/auth",
    EXCHANGE_CODE: "/api/spotify/exchange-code",
    SAVE_TOKEN: "/api/spotify/save-token",
    GET_TOKEN: "/api/spotify/get-token",
    NOW_PLAYING: "/api/spotify/now-playing",
    PUBLIC_NOW_PLAYING: "/api/spotify/public-now-playing",
  },
  AUTH: {
    AUTHENTICATE: "/api/authenticate",
    CHECK_AUTH: "/api/check-auth",
  },
} as const;

// Spotify Configuration
export const SPOTIFY_CONFIG = {
  SCOPES: ["user-read-currently-playing", "user-read-playback-state", "user-read-recently-played"],
  API_BASE_URL: "https://api.spotify.com/v1",
  AUTH_BASE_URL: "https://accounts.spotify.com/api/token",
  AUTHORIZE_URL: "https://accounts.spotify.com/authorize",
  REDIRECT_URI: {
    PRODUCTION: `${process.env.NEXT_PUBLIC_BASE_URL}/spotify-success`,
    DEVELOPMENT: "http://localhost:3000/spotify-success",
  },
  POLLING_INTERVALS: {
    ACTIVE: 10000, // 10 seconds when playing
    IDLE: 45000, // 45 seconds when not playing
  },
  RETRY_CONFIG: {
    MAX_RETRIES: 5,
    BASE_DELAY: 1000,
    MAX_DELAY: 30000,
  },
} as const;

// Database Configuration
export const DATABASE_CONFIG = {
  COLLECTIONS: {
    CREDENTIALS: "credentials",
  },
  USER_IDS: {
    PUBLIC: 5,
  },
  CONNECTION_OPTIONS: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: "Farukh's Portfolio",
  VERSION: "1.5.0",
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000",
  ENVIRONMENT: process.env.NODE_ENV || "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
} as const;

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  LOADING_TIMEOUT: 10000,
  TOAST_DURATION: 5000,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  SPOTIFY: {
    NO_TOKEN: "Spotify token not available. Please connect to Spotify.",
    AUTH_FAILED: "Spotify authentication failed. Please try again.",
    API_ERROR: "Failed to fetch Spotify data. Please try again.",
    TOKEN_EXPIRED: "Spotify token expired. Please reconnect.",
  },
  DATABASE: {
    CONNECTION_FAILED: "Failed to connect to database.",
    SAVE_FAILED: "Failed to save data to database.",
    FETCH_FAILED: "Failed to fetch data from database.",
  },
  GENERAL: {
    NETWORK_ERROR: "Network error. Please check your connection.",
    UNKNOWN_ERROR: "An unexpected error occurred.",
    UNAUTHORIZED: "You are not authorized to perform this action.",
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SPOTIFY: {
    CONNECTED: "Spotify connected successfully!",
    TOKEN_SAVED: "Spotify token saved to database.",
    TOKEN_REFRESHED: "Spotify token refreshed successfully.",
  },
  DATABASE: {
    SAVED: "Data saved successfully.",
    UPDATED: "Data updated successfully.",
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Cache Keys
export const CACHE_KEYS = {
  SPOTIFY_TOKEN: "spotify_token",
  SPOTIFY_NOW_PLAYING: "spotify_now_playing",
  USER_AUTH: "user_auth",
} as const;

// Storage Keys (for localStorage if needed)
export const STORAGE_KEYS = {
  SPOTIFY_REFRESH_TOKEN: "spotify_refresh_token",
  SPOTIFY_ACCESS_TOKEN: "spotify_access_token",
  SPOTIFY_TOKEN_EXPIRY: "spotify_access_token_expiry",
} as const;
