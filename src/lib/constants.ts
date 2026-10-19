/**
 * App-wide constants. Prefer `@/lib/constants`.
 */

export { BLOG_CONFIG, MDX_CONTENT_PATHS } from "./constants/blog";

// --- routes ---
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
  YOUTUBE_MUSIC_SUCCESS: "/youtube-music-success",
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  /** Unified music service routes — pass `?service=spotify|youtube_music|apple_music` */
  MUSIC: {
    AUTH: "/api/music/auth",
    EXCHANGE_CODE: "/api/music/exchange-code",
    GET_TOKEN: "/api/music/get-token",
    REFRESH_TOKEN: "/api/music/refresh-token",
    DISCONNECT: "/api/music/disconnect",
    PUBLIC_NOW_PLAYING: "/api/music/public-now-playing",
  },
  AUTH: {
    AUTHENTICATE: "/api/authenticate",
    CHECK_AUTH: "/api/check-auth",
    LOGOUT: "/api/logout",
  },
  OG_GENERATE: "/api/og/generate",
  BLOG: {
    POSTS: "/api/blog/posts",
  },
} as const;

/** Unified music API service query / body key (?service=spotify) */
export const MUSIC_SERVICE_QUERY = "service" as const;

/**
 * Public now-playing aggregate (About): Spotify live → freshest non–youtube_music last-played.
 * Use with `/api/music/public-now-playing?service=all`.
 */
export const MUSIC_AGGREGATE_SERVICE = "all" as const;

/** Admin dashboard service tab query key (?tab=spotify) */
export const ADMIN_TAB_QUERY = "tab" as const;

/** Admin dashboard tab ids (URL ?tab= values) — distinct from DATABASE_CONFIG.MUSIC_SERVICES */
export const ADMIN_SERVICE_IDS = {
  SPOTIFY: "spotify",
  YOUTUBE_MUSIC: "youtube-music",
  APPLE_MUSIC: "apple-music",
} as const;

export const DEFAULT_ADMIN_SERVICE_ID = ADMIN_SERVICE_IDS.SPOTIFY;

// --- network ---
/** Shared URL / host helpers for OAuth redirects and public rate limiting */
export const NETWORK = {
  HTTPS_PREFIX: "https://",
  HTTP_PREFIX: "http://",
  DEFAULT_DEV_PORT: "3000",
  X_FORWARDED_FOR: "x-forwarded-for",
  UNKNOWN_CLIENT: "unknown",
  RETRY_AFTER: "Retry-After",
} as const;

/** OAuth token exchange auth modes for shared music lifecycle handlers */
export const OAUTH_TOKEN_AUTH = {
  BASIC: "basic",
  BODY_SECRET: "body_secret",
} as const;

/** In-memory rate limit for public now-playing endpoints */
export const PUBLIC_NOW_PLAYING_RATE_LIMIT = {
  WINDOW_MS: 60_000,
  MAX_PER_WINDOW: 90,
  BUCKET_CLEANUP_THRESHOLD: 5_000,
  TOO_MANY_REQUESTS_ERROR: "Too many requests",
} as const;

// Auth / session (admin password protection)
export const AUTH_CONFIG = {
  SESSION_COOKIE: "auth-session",
  SESSION_MAX_AGE: 86400, // 24 hours
  COOKIE_PATH: "/",
  SAME_SITE: "lax",
} as const;

// Shared HTTP method strings used by Spotify API routes
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  DELETE: "DELETE",
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  FOUND: 302,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  TOO_MANY_REQUESTS: 429,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL_SERVER_ERROR: 500,
} as const;
/** Shared OAuth HTTP auth helpers for music lifecycle handlers */
export const OAUTH_CONFIG = {
  BASIC_AUTH_PREFIX: "Basic ",
  DEFAULT_CLIENT_SECRET_PARAM: "client_secret",
  BASE64_ENCODING: "base64",
} as const;

/** Browser / DOM strings used by public music clients */
export const BROWSER_API = {
  ABORT_ERROR_NAME: "AbortError",
  VISIBILITY_CHANGE: "visibilitychange",
  VISIBILITY_VISIBLE: "visible",
} as const;

// --- database ---
// Database Configuration
export const DATABASE_CONFIG = {
  DATABASE_NAME: "syncapp",
  /**
   * Music OAuth services stored together in SERVICE_CREDENTIALS, keyed by `service`.
   * Collection name stays `spotify_credentials` for existing Spotify documents.
   */
  MUSIC_SERVICES: {
    SPOTIFY: "spotify",
    YOUTUBE_MUSIC: "youtube_music",
    APPLE_MUSIC: "apple_music",
  },
  COLLECTIONS: {
    /** SyncApp platform credentials (LinkedIn, DEV.to, etc.) — do not store music OAuth here */
    CREDENTIALS: "credentials",
    /**
     * Unified music OAuth document (one per user_id) with nested
     * `spotify` / `youtube_music` / `apple_music` token objects.
     * Collection name kept for existing data.
     */
    SERVICE_CREDENTIALS: "spotify_credentials",
    /**
     * Pre-unified YouTube Music tokens collection.
     * Migrated into SERVICE_CREDENTIALS.youtube_music on read.
     */
    YOUTUBE_MUSIC_CREDENTIALS_LEGACY: "youtube_music_credentials",
    /** Shared last-played metadata for all music services (keyed by `service`). */
    MUSIC_LAST_PLAYED: "music_last_played",
  },
  /**
   * About last-played window when not currently listening.
   * Freshest music_last_played older than this is hidden.
   */
  LAST_PLAYED_FRESHNESS_MS: 30 * 60 * 1000,
  USER_IDS: {
    PUBLIC: 5,
  },
  // Tuned for Vercel serverless + low-concurrency Spotify token reads (OLTP).
  CONNECTION_OPTIONS: {
    maxPoolSize: 5, // One pool per warm function instance; Spotify API is low concurrency
    minPoolSize: 0, // Avoid idle connections between invocations
    maxIdleTimeMS: 20_000, // Release unused sockets quickly in serverless
    connectTimeoutMS: 15_000, // SRV DNS + TLS can exceed 5s on cold starts
    serverSelectionTimeoutMS: 15_000, // Replica set discovery / failover window
    socketTimeoutMS: 30_000, // Short token reads; fail fast on hung sockets
  },
  CONNECT_RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY_MS: 500,
  },
} as const;

// --- music ---
/** About NowPlaying widget layout / image host markers */
export const NOW_PLAYING_UI = {
  UNOPTIMIZED_IMAGE_HOST_MARKERS: ["ytimg.com", "ggpht.com", "mzstatic.com"] as const,
  MARQUEE_MAX_WIDTH_BUTTON: 180,
  MARQUEE_MAX_WIDTH_HOVER: 200,
  BUTTON_ID: "about",
  FALLBACK_HREF: "#",
  AVATAR_MARGIN_LEFT: "-1.5rem",
  AVATAR_MARGIN_RIGHT: "0.25rem",
  HOVER_PANEL: {
    TOP: "110%",
    MIN_WIDTH: "260px",
    Z_INDEX: 20,
    BORDER_RADIUS: "12px",
    BOX_SHADOW: "0 8px 24px rgba(0,0,0,0.2)",
    PADDING: "12px",
    STATUS_FONT_SIZE: 11,
    META_FONT_SIZE: 12,
    TITLE_FONT_WEIGHT: 600,
  },
} as const;

// Spotify Configuration
export const SPOTIFY_CONFIG = {
  SCOPES: ["user-read-currently-playing", "user-read-playback-state", "user-read-recently-played"],
  API_BASE_URL: "https://api.spotify.com/v1",
  AUTH_BASE_URL: "https://accounts.spotify.com/api/token",
  AUTHORIZE_URL: "https://accounts.spotify.com/authorize",
  CURRENTLY_PLAYING_PATH: "/me/player/currently-playing",
  /** Include podcasts; without this Spotify often returns item: null for episodes */
  CURRENTLY_PLAYING_ADDITIONAL_TYPES: "track,episode",
  REDIRECT_URI: {
    PRODUCTION: `${process.env.NEXT_PUBLIC_BASE_URL}/spotify-success`,
    // Spotify rejects `localhost` — use loopback IP (http allowed only for 127.0.0.1 / ::1)
    // Register this exact URI in the Spotify Developer Dashboard redirect settings.
    DEVELOPMENT: "http://127.0.0.1:3000/spotify-success",
  },
  LOOPBACK_HOST: "127.0.0.1",
  LOCALHOST_HOST: "localhost",
  /** Cookie used to hold PKCE code_verifier between authorize and token exchange */
  PKCE_COOKIE: "spotify_pkce_verifier",
  PKCE_STATE_COOKIE: "spotify_oauth_state",
  PKCE_COOKIE_MAX_AGE: 600, // 10 minutes
  PKCE_VERIFIER_LENGTH: 64,
  OAUTH_STATE_BYTES: 16,
  CODE_CHALLENGE_METHOD: "S256",
  RESPONSE_TYPE: "code",
  DEFAULT_TOKEN_TYPE: "Bearer",
  DEFAULT_EXPIRES_IN: 3600,
  /** Public metadata only — safe for shared CDN caches (short TTL) */
  NOW_PLAYING_CACHE_CONTROL: "public, s-maxage=10, stale-while-revalidate=30",
  GRANT_TYPE: {
    AUTHORIZATION_CODE: "authorization_code",
    REFRESH_TOKEN: "refresh_token",
  },
  HEADERS: {
    JSON: "application/json",
    FORM_URLENCODED: "application/x-www-form-urlencoded",
    CACHE_CONTROL: "Cache-Control",
    CONTENT_TYPE: "Content-Type",
    AUTHORIZATION: "Authorization",
    SET_COOKIE: "Set-Cookie",
  },
  COOKIE: {
    PATH: "/",
    SAME_SITE: "lax",
  },
  QUERY: {
    CLIENT_ID: "client_id",
    RESPONSE_TYPE: "response_type",
    REDIRECT_URI: "redirect_uri",
    SCOPE: "scope",
    STATE: "state",
    CODE: "code",
    ERROR: "error",
    CODE_CHALLENGE: "code_challenge",
    CODE_CHALLENGE_METHOD: "code_challenge_method",
    SHOW_DIALOG: "show_dialog",
    ACCESS_DENIED: "access_denied",
    MESSAGE: "message",
  },
  SHOW_DIALOG_VALUE: "true",
  FETCH_CREDENTIALS: "same-origin",
  POLLING_INTERVALS: {
    ACTIVE: 10000, // 10 seconds when playing
    IDLE: 45000, // 45 seconds when not playing
  },
  RETRY_CONFIG: {
    MAX_RETRIES: 5,
    BASE_DELAY: 1000,
    MAX_DELAY: 30000,
  },
  UNKNOWN_TRACK: "Unknown track",
  UNKNOWN_ARTIST: "Unknown artist",
} as const;

/** Google OAuth for YouTube Music admin connect (no official live / history Data API) */
export const YOUTUBE_MUSIC_CONFIG = {
  AUTHORIZE_URL: "https://accounts.google.com/o/oauth2/v2/auth",
  TOKEN_URL: "https://oauth2.googleapis.com/token",
  SCOPES: ["https://www.googleapis.com/auth/youtube.readonly"],
  REDIRECT_URI: {
    PRODUCTION: `${process.env.NEXT_PUBLIC_BASE_URL}/youtube-music-success`,
    // PKCE cookies are host-bound — use loopback IP locally (same pattern as Spotify)
    DEVELOPMENT: "http://127.0.0.1:3000/youtube-music-success",
  },
  LOOPBACK_HOST: "127.0.0.1",
  LOCALHOST_HOST: "localhost",
  PKCE_COOKIE: "youtube_music_pkce_verifier",
  PKCE_STATE_COOKIE: "youtube_music_oauth_state",
  PKCE_COOKIE_MAX_AGE: 600,
  PKCE_VERIFIER_LENGTH: 64,
  OAUTH_STATE_BYTES: 16,
  CODE_CHALLENGE_METHOD: "S256",
  RESPONSE_TYPE: "code",
  ACCESS_TYPE: "offline",
  PROMPT: "consent",
  DEFAULT_TOKEN_TYPE: "Bearer",
  DEFAULT_EXPIRES_IN: 3600,
  GRANT_TYPE: {
    AUTHORIZATION_CODE: "authorization_code",
    REFRESH_TOKEN: "refresh_token",
  },
  HEADERS: {
    JSON: "application/json",
    FORM_URLENCODED: "application/x-www-form-urlencoded",
    CACHE_CONTROL: "Cache-Control",
    CONTENT_TYPE: "Content-Type",
    AUTHORIZATION: "Authorization",
    SET_COOKIE: "Set-Cookie",
  },
  COOKIE: {
    PATH: "/",
    SAME_SITE: "lax" as const,
  },
  QUERY: {
    CLIENT_ID: "client_id",
    CLIENT_SECRET: "client_secret",
    REDIRECT_URI: "redirect_uri",
    RESPONSE_TYPE: "response_type",
    SCOPE: "scope",
    STATE: "state",
    CODE: "code",
    ERROR: "error",
    CODE_CHALLENGE: "code_challenge",
    CODE_CHALLENGE_METHOD: "code_challenge_method",
    ACCESS_TYPE: "access_type",
    PROMPT: "prompt",
    ACCESS_DENIED: "access_denied",
  },
  FETCH_CREDENTIALS: "same-origin" as const,
  /** Kept for client runtime slot shape; YTM has no now-playing detection. */
  POLLING_INTERVALS: {
    ACTIVE: 20000,
    IDLE: 60000,
  },
} as const;

/**
 * Apple Music / MusicKit on the Web.
 * Official Apple Music API has no visitor-facing live “now playing” feed —
 * public preview uses recently played + last-played persistence (same lesson as YouTube Music).
 */
export const APPLE_MUSIC_CONFIG = {
  API_BASE_URL: "https://api.music.apple.com/v1",
  RECENTLY_PLAYED_PATH: "/me/recent/played/tracks",
  RECENTLY_PLAYED_LIMIT: "1",
  MUSICKIT_SCRIPT_URL: "https://js-cdn.music.apple.com/musickit/v3/musickit.js",
  MUSICKIT_APP_BUILD: "1.0.0",
  JWT_ALGORITHM: "ES256",
  /** Max JWT lifetime Apple allows is ~6 months; keep shorter for rotation */
  DEVELOPER_TOKEN_TTL_SECONDS: 60 * 60 * 12,
  DEFAULT_TOKEN_TYPE: "Bearer",
  /** Stored refresh_token sentinel — Music User Tokens have no OAuth refresh grant */
  USER_TOKEN_SENTINEL: "musickit_user_token",
  DEFAULT_EXPIRES_IN: 60 * 60 * 24 * 180,
  NOW_PLAYING_CACHE_CONTROL: "public, s-maxage=15, stale-while-revalidate=45",
  FETCH_CREDENTIALS: "same-origin" as const,
  POLLING_INTERVALS: {
    ACTIVE: 20000,
    IDLE: 60000,
  },
  ALBUM_LABEL: "Apple Music",
  UNKNOWN_TRACK: "Unknown track",
  ARTWORK_SIZE: 300,
  ARTWORK_WIDTH_TOKEN: "{w}",
  ARTWORK_HEIGHT_TOKEN: "{h}",
  CATALOG_BASE_URL: "https://music.apple.com",
  SONG_PATH_PREFIX: "/song/",
  HEADERS: {
    JSON: "application/json",
    AUTHORIZATION: "Authorization",
    MUSIC_USER_TOKEN: "Music-User-Token",
    CONTENT_TYPE: "Content-Type",
    CACHE_CONTROL: "Cache-Control",
    SET_COOKIE: "Set-Cookie",
  },
} as const;

export const YOUTUBE_MUSIC_UI = {
  LOADING_PROCESSING: "Processing...",
  LOADING_EXCHANGING: "Exchanging authorization code for tokens...",
  ERROR_TITLE: "Error",
  TRY_AGAIN: "Try Again",
  GO_TO_ADMIN: "Back to Admin",
  SUCCESS_TITLE: "YouTube Music Connected!",
  TOKENS_SAVED_MESSAGE: "Your connection was saved securely on the server.",
  TOAST_CONNECTED_TITLE: "YouTube Music Connected!",
  TOAST_AUTH_FAILED_TITLE: "YouTube Music Error",
  TOAST_EXCHANGE_FAILED_TITLE: "Exchange Failed",
  TOAST_CONNECTION_ERROR_TITLE: "Connection Error",
  LAST_PLAYED_LABEL: "Recent on YouTube Music",
} as const;

export const APPLE_MUSIC_UI = {
  LAST_PLAYED_LABEL: "Recent on Apple Music",
} as const;

/**
 * Build a unified music API URL with the required service identifier.
 * Example: musicApiUrl("AUTH", "spotify") → "/api/music/auth?service=spotify"
 */
export function musicApiUrl(
  operation: keyof typeof API_ENDPOINTS.MUSIC,
  service:
    | (typeof DATABASE_CONFIG.MUSIC_SERVICES)[keyof typeof DATABASE_CONFIG.MUSIC_SERVICES]
    | typeof MUSIC_AGGREGATE_SERVICE,
): string {
  return `${API_ENDPOINTS.MUSIC[operation]}?${MUSIC_SERVICE_QUERY}=${encodeURIComponent(service)}`;
}

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
  TRY_AGAIN: "Try Again 🔄",
  GO_TO_HOME: "Go to Home",
  SUCCESS_TITLE: "🎉 Spotify Connected!",
  TOKENS_SAVED_MESSAGE: "Your tokens have been saved to the database and are now publicly accessible.",
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
  AUTH_ADMIN_NOTE: "Admin login is required. Tokens are stored only on the server.",
  AUTH_PERMISSION_CURRENTLY_PLAYING: "• See what you're currently playing",
  AUTH_PERMISSION_PLAYBACK_STATE: "• See your playback state",
  AUTH_PERMISSION_RECENTLY_PLAYED: "• See your recently played tracks",
  AUTH_AFTER_MESSAGE:
    "After authorization, tokens are stored only on the server. The about page shows public track metadata only.",
  TOAST_AUTH_FAILED_TITLE: "Spotify Auth Failed",
  TOAST_EXCHANGE_FAILED_TITLE: "Exchange Failed",
  TOAST_CONNECTION_ERROR_TITLE: "Connection Error",
  LAST_PLAYED_LABEL: "Last played",
  CURRENTLY_LISTENING_LABEL: "Currently listening",
} as const;

// Spotify auth error keys (URL param values)
export const SPOTIFY_AUTH_ERROR = {
  AUTH_FAILED: "auth_failed",
  NO_CODE: "no_code",
  TOKEN_EXCHANGE_FAILED: "token_exchange_failed",
} as const;

// --- messages ---
// Error Messages
export const ERROR_MESSAGES = {
  SPOTIFY: {
    NO_TOKEN: "Spotify token not available. Please connect to Spotify.",
    NO_AUTH_CODE: "No authorization code found",
    AUTH_FAILED: "Spotify authentication failed. Please try again.",
    AUTH_CANCELLED: "The Spotify authorization was cancelled or failed. Please try again.",
    NO_CODE_RECEIVED: "No authorization code received from Spotify. Please try again.",
    API_ERROR: "Failed to fetch Spotify data. Please try again.",
    TOKEN_EXPIRED: "Spotify token expired. Please reconnect.",
    ADMIN_REQUIRED: "Admin login required before connecting Spotify",
    ADMIN_REQUIRED_SHORT: "Admin login required",
    NO_ACTIVE_TOKEN: "No active Spotify token found",
    METHOD_NOT_ALLOWED: "Method not allowed",
    AUTH_CODE_REQUIRED: "Authorization code is required",
    MISSING_PKCE: "Missing PKCE verifier. Start again from /spotify-auth.",
    INVALID_OAUTH_STATE: "Invalid OAuth state",
    EXCHANGE_FAILED: "Failed to exchange authorization code",
    EXCHANGE_CODE_FAILED_PREFIX: "Failed to exchange code: ",
    TOKEN_EXCHANGE_FAILED_PREFIX: "Failed to exchange the authorization code: ",
    INVALID_TOKEN_RESPONSE: "Invalid token response from Spotify",
    SAVE_FAILED: "Failed to save Spotify token",
    SAVE_VIA_CLIENT_REMOVED: "Client token save is no longer supported. Connect via OAuth; use DELETE to disconnect.",
    DISCONNECT_FAILED: "Failed to disconnect Spotify",
    REFRESH_FAILED: "Failed to refresh token",
    PERSIST_REFRESH_FAILED: "Failed to persist refreshed token",
    FETCH_PLAYING_FAILED: "Failed to get current playing track from Spotify",
    DASHBOARD_REDIRECT_HINT:
      "Confirm redirect URI http://127.0.0.1:3000/spotify-success is saved in the Spotify Dashboard, then open http://127.0.0.1:3000/spotify-auth.",
  },
  YOUTUBE_MUSIC: {
    ADMIN_REQUIRED: "Admin login required before connecting YouTube Music",
    ADMIN_REQUIRED_SHORT: "Admin login required",
    NO_ACTIVE_TOKEN: "No active YouTube Music token found",
    METHOD_NOT_ALLOWED: "Method not allowed",
    AUTH_CODE_REQUIRED: "Authorization code is required",
    MISSING_PKCE: "Missing PKCE verifier. Start again from Connect YouTube Music.",
    INVALID_OAUTH_STATE: "Invalid OAuth state",
    EXCHANGE_FAILED: "Failed to exchange authorization code",
    EXCHANGE_CODE_FAILED_PREFIX: "Failed to exchange code: ",
    INVALID_TOKEN_RESPONSE: "Invalid token response from Google",
    SAVE_FAILED: "Failed to save YouTube Music token",
    DISCONNECT_FAILED: "Failed to disconnect YouTube Music",
    REFRESH_FAILED: "Failed to refresh token",
    PERSIST_REFRESH_FAILED: "Failed to persist refreshed token",
    API_ERROR: "Failed to fetch YouTube Music data. Please try again.",
    AUTH_CANCELLED: "YouTube Music authorization was cancelled or failed. Please try again.",
    NO_AUTH_CODE: "No authorization code found",
    AUTH_FAILED: "YouTube Music authentication failed. Please try again.",
    DASHBOARD_REDIRECT_HINT:
      "Confirm redirect URI http://127.0.0.1:3000/youtube-music-success is saved in Google Cloud Console, then reconnect from Admin.",
    CLIENT_ID_REQUIRED: "YOUTUBE_MUSIC_CLIENT_ID environment variable is required",
    CLIENT_SECRET_REQUIRED: "YOUTUBE_MUSIC_CLIENT_SECRET environment variable is required",
  },
  APPLE_MUSIC: {
    ADMIN_REQUIRED: "Admin login required before connecting Apple Music",
    ADMIN_REQUIRED_SHORT: "Admin login required",
    NO_ACTIVE_TOKEN: "No active Apple Music user token found",
    METHOD_NOT_ALLOWED: "Method not allowed",
    USER_TOKEN_REQUIRED: "Music user token is required",
    SAVE_FAILED: "Failed to save Apple Music token",
    DISCONNECT_FAILED: "Failed to disconnect Apple Music",
    REFRESH_FAILED: "Failed to validate Apple Music token",
    API_ERROR: "Failed to fetch Apple Music data. Please try again.",
    AUTH_FAILED: "Apple Music authorization failed. Please try again.",
    AUTH_CANCELLED: "Apple Music authorization was cancelled.",
    TEAM_ID_REQUIRED: "MUSIC_KIT_TEAM_ID environment variable is required",
    KEY_ID_REQUIRED: "MUSIC_KIT_KEY_ID environment variable is required",
    PRIVATE_KEY_REQUIRED: "MUSIC_KIT_PRIVATE_KEY environment variable is required",
    MUSIC_KIT_ID_REQUIRED: "MUSIC_KIT_ID environment variable is required",
    DEVELOPER_TOKEN_FAILED: "Failed to create MusicKit developer token",
    SCRIPT_LOAD_FAILED: "Failed to load MusicKit JS",
  },
  DATABASE: {
    CONNECTION_FAILED: "Failed to connect to database.",
    SAVE_FAILED: "Failed to save data to database.",
    FETCH_FAILED: "Failed to fetch data from database.",
  },
  MUSIC: {
    METHOD_NOT_ALLOWED: "Method not allowed",
    INVALID_SERVICE:
      "Invalid music service. Use service=spotify|youtube_music|apple_music (or all for public now-playing).",
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
    TOKENS_SAVED_TOAST: "Your Spotify connection was saved securely on the server.",
    TOKEN_SAVED: "Spotify token saved to database.",
    TOKEN_REFRESHED: "Spotify token refreshed successfully.",
    DISCONNECTED: "Spotify disconnected",
    IS_CONNECTED: "Spotify is connected",
    NOT_CONNECTED: "Spotify is not connected",
    REFRESHED: "Token refreshed successfully",
  },
  YOUTUBE_MUSIC: {
    CONNECTED: "YouTube Music connected successfully!",
    DISCONNECTED: "YouTube Music disconnected",
    IS_CONNECTED: "YouTube Music is connected",
    NOT_CONNECTED: "YouTube Music is not connected",
    REFRESHED: "Token refreshed successfully",
  },
  APPLE_MUSIC: {
    CONNECTED: "Apple Music connected successfully!",
    DISCONNECTED: "Apple Music disconnected",
    IS_CONNECTED: "Apple Music is connected",
    NOT_CONNECTED: "Apple Music is not connected",
    REFRESHED: "Apple Music connection revalidated",
  },
  DATABASE: {
    SAVED: "Data saved successfully.",
    UPDATED: "Data updated successfully.",
  },
} as const;

/**
 * Console log / warn / error message strings for music integrations.
 * Keep dynamic parts as functions so call sites stay type-safe.
 */
export const LOG_MESSAGES = {
  MUSIC_API: {
    APPLE_AUTH_ERROR: "Apple Music auth (developer token) error:",
    APPLE_EXCHANGE_ERROR: "Error storing Apple Music user token:",
    APPLE_GET_TOKEN_ERROR: "Error getting Apple Music connection status:",
    APPLE_REFRESH_ERROR: "Error revalidating Apple Music token:",
    APPLE_DISCONNECT_ERROR: "Error disconnecting Apple Music:",
    PRIORITY_PUBLIC_NOW_PLAYING_ERROR: "Error getting priority public now playing:",
    publicNowPlayingError: (service: string) => `Error getting public now playing (${service}):`,
  },
  OAUTH_LIFECYCLE: {
    authError: (serviceName: string) => `${serviceName} auth error:`,
    tokenExchangeFailed: (serviceName: string) => `${serviceName} token exchange failed:`,
    tokenExchangeError: (serviceName: string) => `Error in ${serviceName} token exchange:`,
    getTokenError: (serviceName: string) => `Error getting ${serviceName} connection status:`,
    refreshError: (serviceName: string) => `Error refreshing ${serviceName} token:`,
    disconnectError: (serviceName: string) => `Error disconnecting ${serviceName}:`,
  },
  PUBLIC_CLIENT: {
    PRIORITY_LABEL: "music priority",
    fetchError: (label: string) => `Error fetching public ${label} data:`,
  },
  APPLE_MUSIC: {
    DEVELOPER_TOKEN_SIGN_FAILED: "Failed to sign MusicKit developer token:",
    RECENTLY_PLAYED_UNAVAILABLE: "Apple Music recently played unavailable:",
    PUBLIC_NOW_PLAYING_FAILED: "Apple Music public now-playing fetch failed:",
  },
  YOUTUBE_MUSIC: {
    REFRESH_TOKEN_FAILED: "Failed to refresh YouTube Music token:",
    REFRESH_TOKEN_ERROR: "Error refreshing YouTube Music token:",
  },
  SPOTIFY: {
    PERSIST_REFRESH_FAILED: "Failed to persist refreshed Spotify token:",
    CURRENTLY_PLAYING_UNAVAILABLE: "Spotify currently-playing unavailable:",
    ACCESS_RESTRICTED_PATTERN: /premium subscription required|player command failed|restriction/i,
  },
  HOOKS: {
    SPOTIFY_CHECK_AUTH: "Error checking Spotify auth status:",
    SPOTIFY_DISCONNECT: "Error disconnecting Spotify:",
    SPOTIFY_REFRESH: "Error refreshing Spotify token:",
    YOUTUBE_CHECK_AUTH: "Error checking YouTube Music auth status:",
    YOUTUBE_DISCONNECT: "Error disconnecting YouTube Music:",
    YOUTUBE_REFRESH: "Error refreshing YouTube Music token:",
    APPLE_CHECK_AUTH: "Error checking Apple Music auth status:",
    APPLE_CONNECT: "Error connecting Apple Music:",
    APPLE_DISCONNECT: "Error disconnecting Apple Music:",
    APPLE_REFRESH: "Error refreshing Apple Music token:",
  },
  DATABASE: {
    MONGODB_CONNECTION_FAILED: "❌ MongoDB connection failed:",
    saveTokenError: (service: string) => `Error saving ${service} token:`,
    MIGRATE_SPOTIFY_START: "🔄 Migrating Spotify token from legacy credentials collection...",
    MIGRATE_SPOTIFY_SAVE_FAILED: "Failed to migrate Spotify token to service credentials:",
    MIGRATE_SPOTIFY_DONE: "✅ Spotify token migrated to shared service credentials",
    MIGRATE_SPOTIFY_ERROR: "Error migrating Spotify token from legacy collection:",
    SPOTIFY_CONNECTION_STATUS_ERROR: "Error checking Spotify connection status:",
    TOKEN_ABOUT_TO_EXPIRE: "🔄 Token is about to expire, refreshing...",
    TOKEN_REFRESHED: "✅ Token refreshed successfully",
    TOKEN_EXPIRED_REFRESH_FAILED: "❌ Token expired and refresh failed",
    TOKEN_REFRESH_FAILED_USING_EXISTING: "❌ Failed to refresh token, using existing token",
    GET_SPOTIFY_TOKEN_ERROR: "Error getting Spotify token:",
    BOOTSTRAP_SPOTIFY_REFRESH: "🔄 Bootstrapping Spotify token from SPOTIFY_REFRESH_TOKEN...",
    UPDATE_SPOTIFY_TOKEN_ERROR: "Error updating Spotify token:",
    DEACTIVATE_SPOTIFY_TOKEN_ERROR: "Error deactivating Spotify token:",
    saveLastPlayedError: (service: string) => `Error saving ${service} last played:`,
    fetchLastPlayedError: (service: string) => `Error fetching ${service} last played:`,
    clearLastPlayedError: (service: string) => `Error clearing ${service} last played:`,
    NEWEST_LAST_PLAYED_ERROR: "Error fetching newest music last-played:",
    MIGRATE_YOUTUBE_START: "🔄 Migrating YouTube Music token into shared service credentials...",
    MIGRATE_YOUTUBE_SAVE_FAILED: "Failed to migrate YouTube Music token:",
    MIGRATE_YOUTUBE_DONE: "✅ YouTube Music token migrated to shared service credentials",
    MIGRATE_YOUTUBE_ERROR: "Error migrating YouTube Music token from legacy collection:",
    GET_YOUTUBE_TOKEN_ERROR: "Error fetching YouTube Music token:",
    YOUTUBE_CONNECTION_STATUS_ERROR: "Error checking YouTube Music connection status:",
    UPDATE_YOUTUBE_TOKEN_ERROR: "Error updating YouTube Music token:",
    DEACTIVATE_YOUTUBE_TOKEN_ERROR: "Error deactivating YouTube Music token:",
    GET_APPLE_TOKEN_ERROR: "Error fetching Apple Music token:",
    APPLE_CONNECTION_STATUS_ERROR: "Error checking Apple Music connection status:",
    UPDATE_APPLE_TOKEN_ERROR: "Error updating Apple Music token:",
    DEACTIVATE_APPLE_TOKEN_ERROR: "Error deactivating Apple Music token:",
  },
} as const;

// --- app-ui ---
// Application Configuration
export const APP_CONFIG = {
  NAME: "Farukh Saifi Portfolio",
  VERSION: "1.5.0",
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "localhost:3000",
  ENVIRONMENT: process.env.NODE_ENV === "production" ? "production" : "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
} as const;

// UI Configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  LOADING_TIMEOUT: 10000,
  TOAST_DURATION: 5000,
} as const;
// Deprecated — Spotify tokens must never be stored in the browser.
// Kept only so old keys can be cleared if found.
export const STORAGE_KEYS = {
  SPOTIFY_REFRESH_TOKEN: "spotify_refresh_token",
  SPOTIFY_ACCESS_TOKEN: "spotify_access_token",
  SPOTIFY_TOKEN_EXPIRY: "spotify_access_token_expiry",
} as const;
// Route guard / password protection UI
export const ROUTE_GUARD_UI = {
  PASSWORD_PROTECTED: "This page is password protected",
  PASSWORD_LABEL: "Password",
  SUBMIT: "Submit",
  INCORRECT_PASSWORD: "Incorrect password",
} as const;

// Admin dashboard UI
export const ADMIN_UI = {
  TITLE: "Admin",
  SUBTITLE: "Manage connected services for this site.",
  SIGN_OUT: "Sign out",
  SESSION_LABEL: "Signed in as",
  COMING_SOON: "Coming soon",
  COMING_SOON_DETAIL: "This service is not wired up yet. Enable it in the admin service registry.",
  SPOTIFY: {
    HEADING: "Spotify",
    CONNECTION: "Connection",
    CONNECTED: "Connected",
    NOT_CONNECTED: "Not connected",
    CONNECT: "Connect Spotify",
    REFRESH: "Refresh token",
    DISCONNECT: "Disconnect",
    PREVIEW: "Public preview",
    LIVE: "Now playing",
    LAST_PLAYED: "Last played",
    NO_TRACK: "No track to show yet. Connect Spotify and play a song.",
    ACTION_ERROR: "Action failed. Try again.",
    REFRESHED: "Token refreshed on the server.",
    DISCONNECTED: "Spotify disconnected.",
  },
  YOUTUBE_MUSIC: {
    HEADING: "YouTube Music",
    CONNECTION: "Connection",
    CONNECTED: "Connected",
    NOT_CONNECTED: "Not connected",
    CONNECT: "Connect YouTube Music",
    REFRESH: "Refresh token",
    DISCONNECT: "Disconnect",
    PREVIEW: "Public preview",
    LIVE: "Now playing",
    LAST_PLAYED: "Last played",
    NO_TRACK: "No track preview — playback detection is not available for YouTube Music.",
    ACTION_ERROR: "Action failed. Try again.",
    REFRESHED: "Token refreshed on the server.",
    DISCONNECTED: "YouTube Music disconnected.",
    API_NOTE:
      "OAuth credentials are stored for future use. Official APIs do not expose YouTube Music now-playing or listen history.",
  },
  APPLE_MUSIC: {
    HEADING: "Apple Music",
    CONNECTION: "Connection",
    CONNECTED: "Connected",
    NOT_CONNECTED: "Not connected",
    CONNECT: "Connect Apple Music",
    REFRESH: "Refresh",
    DISCONNECT: "Disconnect",
    PREVIEW: "Public preview",
    LIVE: "Recently played",
    LAST_PLAYED: "Recent / last played",
    NO_TRACK: "No track to show yet. Connect Apple Music and play something.",
    ACTION_ERROR: "Action failed. Try again.",
    REFRESHED: "Connection revalidated on the server.",
    DISCONNECTED: "Apple Music disconnected.",
    API_NOTE:
      "Apple Music API has no official live “now playing” feed for this site. Preview uses recently played + last-played metadata.",
  },
} as const;

/** Admin panel async action keys (loading state discriminators) */
export const ADMIN_ACTION_KEYS = {
  CONNECT: "connect",
  REFRESH: "refresh",
  DISCONNECT: "disconnect",
} as const;
