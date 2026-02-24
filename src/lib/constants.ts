// App route paths (for href, redirects, route checks)
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  WORK: "/work",
  BLOG: "/blog",
  GALLERY: "/gallery",
  ADMIN: "/admin",
  SPOTIFY_AUTH: "/spotify-auth",
  SPOTIFY_SUCCESS: "/spotify-success",
  SPOTIFY_TEST: "/spotify-test",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  SPOTIFY: {
    AUTH: "/api/spotify/auth",
    EXCHANGE_CODE: "/api/spotify/exchange-code",
    SAVE_TOKEN: "/api/spotify/save-token",
    GET_TOKEN: "/api/spotify/get-token",
    REFRESH_TOKEN: "/api/spotify/refresh-token",
    NOW_PLAYING: "/api/spotify/now-playing",
    PUBLIC_NOW_PLAYING: "/api/spotify/public-now-playing",
  },
  AUTH: {
    AUTHENTICATE: "/api/authenticate",
    CHECK_AUTH: "/api/check-auth",
  },
  OG_GENERATE: "/api/og/generate",
} as const;

// Spotify Configuration
export const SPOTIFY_CONFIG = {
  SCOPES: [
    "user-read-currently-playing",
    "user-read-playback-state",
    "user-read-recently-played",
  ],
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
  DATABASE_NAME: "syncapp",
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
  NAME: "Farukh Saifi Portfolio",
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
    NO_AUTH_CODE: "No authorization code found",
    AUTH_FAILED: "Spotify authentication failed. Please try again.",
    AUTH_CANCELLED:
      "The Spotify authorization was cancelled or failed. Please try again.",
    NO_CODE_RECEIVED:
      "No authorization code received from Spotify. Please try again.",
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
    CONNECTED_TOAST_TITLE: "Spotify Connected!",
    TOKENS_SAVED_TOAST:
      "Your tokens have been saved to the database and are now publicly accessible.",
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

// Spotify URL / query param keys (e.g. callback params)
export const SPOTIFY_QUERY_KEYS = {
  SPOTIFY: "spotify",
  TOKEN: "token",
} as const;

// Spotify callback status values (from URL after OAuth)
export const SPOTIFY_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
} as const;

// Spotify UI labels (for status notification and Spotify pages)
export const SPOTIFY_UI = {
  TITLE_CONNECTED: "✅ Spotify Connected!",
  TITLE_ERROR: "❌ Spotify Error",
  MESSAGE_CONNECTED: "Your Spotify account has been successfully connected!",
  LABEL_REFRESH_TOKEN: "Refresh Token:",
  INSTRUCTION_TOKEN: "Copy this token and add it to your .env.local file as",
  MESSAGE_ERROR: "There was an error connecting to Spotify. Please try again.",
  ENV_VAR_NAME: "SPOTIFY_REFRESH_TOKEN",
  // Success page
  LOADING_PROCESSING: "🔄 Processing...",
  LOADING_EXCHANGING: "Exchanging authorization code for tokens...",
  ERROR_TITLE: "❌ Error",
  TRY_AGAIN: "Try Again",
  GO_TO_HOME: "Go to Home",
  SUCCESS_TITLE: "🎉 Spotify Connected!",
  TOKENS_SAVED_MESSAGE:
    "Your tokens have been saved to the database and are now publicly accessible.",
  // Auth page
  AUTH_LOADING: "🔄 Loading...",
  AUTH_PLEASE_WAIT: "Please wait...",
  AUTH_TITLE: "🎵 Spotify Authorization",
  AUTH_ERROR_TITLE: "❌ Authorization Error",
  AUTH_TRY_AGAIN: "Try Again",
  AUTH_CLEAR_TOKEN: "Clear Token",
  AUTH_AUTHORIZE_BUTTON: "Authorize with Spotify",
  AUTH_INTRO:
    "To enable the Spotify Now Playing feature, you need to authorize this app to access your Spotify account.",
  AUTH_INTRO_DETAIL:
    "This will allow the app to see what you're currently playing on Spotify and display it in the header.",
  AUTH_REQUIRED_PERMISSIONS: "Required Permissions:",
  AUTH_AFTER_MESSAGE:
    "After authorization, you'll receive a refresh token that will be stored in your browser and can be used for API calls.",
} as const;

// Spotify auth error keys (URL param values)
export const SPOTIFY_AUTH_ERROR = {
  AUTH_FAILED: "auth_failed",
  NO_CODE: "no_code",
  TOKEN_EXCHANGE_FAILED: "token_exchange_failed",
} as const;

// Route guard / password protection UI
export const ROUTE_GUARD_UI = {
  PASSWORD_PROTECTED: "This page is password protected",
  PASSWORD_LABEL: "Password",
  SUBMIT: "Submit",
  INCORRECT_PASSWORD: "Incorrect password",
} as const;
