import type { ComponentType } from "react";

export interface SimplifiedTrack {
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  songUrl: string;
}

/**
 * Shared last-played / public display service id
 * (`music_last_played.service` and About NowPlaying source).
 */
export type SharedLastPlayedServiceId = "spotify" | "youtube_music" | "apple_music";

export interface NowPlayingPayload {
  isPlaying: boolean;
  /** True when the track is the persisted last-played fallback (not live playback) */
  isLastPlayed: boolean;
  track: SimplifiedTrack | null;
  /** ISO play / fetch time for public freshness window (never secrets) */
  playedAt?: string;
}

export interface PublicNowPlayingPayload extends NowPlayingPayload {
  timestamp: string;
  /** Which music service produced this public payload (priority aggregate) */
  source?: SharedLastPlayedServiceId;
}

/** Shared last-played row in `music_last_played` (Spotify / YouTube Music / Apple Music). */
export interface MusicLastPlayed {
  user_id: number;
  service: SharedLastPlayedServiceId;
  /** YouTube videoId, Apple Music trackId, or optional Spotify track id */
  externalId?: string;
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  songUrl: string;
  playedAt: Date;
}

export type CurrentlyPlayingResult =
  | { ok: true; payload: NowPlayingPayload }
  | { ok: false; status: number; error: string };

export interface AdminSession {
  id: string;
  email: string;
  name?: string;
  role?: string;
  isAuthenticated: boolean;
}

// Database Types
/** Music OAuth service id (nested field on the unified credentials document) */
export type MusicServiceId = "spotify" | "youtube_music" | "apple_music";

/** Per-service token nested under UnifiedMusicCredentials */
export interface MusicServiceToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  is_active: boolean;
  last_updated: Date;
}

/**
 * Single Mongo document for all music OAuth tokens
 * (`spotify_credentials` / SERVICE_CREDENTIALS).
 */
export interface UnifiedMusicCredentials {
  user_id: number;
  spotify?: MusicServiceToken;
  youtube_music?: MusicServiceToken;
  apple_music?: MusicServiceToken;
  last_updated: Date;
}

/**
 * Flat token view returned by databaseService / OAuth lifecycle.
 * Derived from a nested field on UnifiedMusicCredentials.
 */
export interface ServiceCredential extends MusicServiceToken {
  user_id: number;
  service: MusicServiceId;
}

export type SpotifyCredential = ServiceCredential;
export type YoutubeMusicCredential = ServiceCredential;
export type AppleMusicCredential = ServiceCredential;

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Hook Types
export interface UseNowPlayingReturn {
  payload: NowPlayingPayload | null;
  loading: boolean;
  error: string | null;
  refetch?: () => Promise<void>;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

/** Whitelisted public now-playing shape — never includes credentials */
export interface SafePublicNowPlaying {
  isPlaying: boolean;
  isLastPlayed: boolean;
  playedAt: string;
  timestamp: string;
  track: {
    title: string;
    artist: string;
    album: string;
    imageUrl: string;
    songUrl: string;
  } | null;
  /** Present on priority aggregate responses */
  source?: SharedLastPlayedServiceId;
}

/** In-memory rate-limit bucket for public now-playing endpoints */
export interface PublicNowPlayingRateBucket {
  count: number;
  resetAt: number;
}

/** Shared client snapshot for public now-playing subscribers */
export interface PublicNowPlayingSnapshot {
  payload: NowPlayingPayload | null;
  loading: boolean;
  error: string | null;
  /** Set when subscribed to the priority aggregate (`service=all`) */
  source?: SharedLastPlayedServiceId | null;
}

export type PublicNowPlayingListener = (snapshot: PublicNowPlayingSnapshot) => void;

/** About NowPlaying display source (matches SharedLastPlayedServiceId) */
export type MusicDisplaySource = SharedLastPlayedServiceId;

export interface OAuthTokenRefreshResult {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export type CookieSameSite = "lax" | "strict" | "none";
export type OAuthTokenAuthMode = "basic" | "body_secret";

/** Shared Spotify / YouTube Music OAuth route lifecycle configuration */
export interface MusicOAuthLifecycleConfig {
  /** Display name for logs ("Spotify", "YouTube Music") */
  serviceName: string;
  musicServiceId: MusicServiceId;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: readonly string[];
  responseType: string;
  codeChallengeMethod: string;
  pkceCookie: string;
  pkceStateCookie: string;
  pkceCookieMaxAge: number;
  cookiePath: string;
  cookieSameSite: CookieSameSite;
  defaultExpiresIn: number;
  defaultTokenType: string;
  grantTypeAuthorizationCode: string;
  headers: {
    contentType: string;
    formUrlEncoded: string;
    authorization: string;
    setCookie: string;
  };
  query: {
    clientId: string;
    clientSecret?: string;
    responseType: string;
    redirectUri: string;
    scope: string;
    state: string;
    codeChallenge: string;
    codeChallengeMethod: string;
  };
  /** Extra authorize query params (e.g. Google access_type / prompt) */
  authQueryExtras?: Record<string, string>;
  /** Spotify uses Basic; Google puts secret in the body */
  tokenAuth: OAuthTokenAuthMode;
  /** Optional localhost → 127.0.0.1 bounce so PKCE cookies match redirect host */
  localhostHost?: string;
  loopbackHost?: string;
  /** When true, reuse stored refresh_token if provider omits one (Google re-consent) */
  allowMissingRefreshToken?: boolean;
  /** Spotify legacy: reject POST on disconnect route with this message */
  rejectPostDisconnectMessage?: string;
  getClientId: () => string;
  getClientSecret: () => string;
  getRedirectUri: () => string;
  generatePkce: () => { verifier: string; challenge: string; state: string };
  saveToken: (data: Omit<ServiceCredential, "last_updated" | "service">) => Promise<ApiResponse<ServiceCredential>>;
  getToken: () => Promise<ApiResponse<ServiceCredential>>;
  isConnected: () => Promise<boolean>;
  updateToken: (update: OAuthTokenRefreshResult) => Promise<ApiResponse>;
  deactivateToken: () => Promise<ApiResponse>;
  refreshAccessToken: (refreshToken: string) => Promise<OAuthTokenRefreshResult | null>;
  errors: {
    methodNotAllowed: string;
    adminRequired: string;
    adminRequiredShort: string;
    authCodeRequired: string;
    missingPkce: string;
    invalidOauthState: string;
    exchangeFailed: string;
    invalidTokenResponse: string;
    saveFailed: string;
    noActiveToken: string;
    refreshFailed: string;
    persistRefreshFailed: string;
    disconnectFailed: string;
  };
  success: {
    connected: string;
    disconnected: string;
    isConnected: string;
    notConnected: string;
    refreshed: string;
  };
}

/** Minimal MusicKit JS surface used by admin Connect */
export interface MusicKitInstance {
  authorize: () => Promise<string>;
}

export interface MusicKitGlobal {
  configure: (options: { developerToken: string; app: { name: string; build?: string } }) => Promise<MusicKitInstance>;
  getInstance: () => MusicKitInstance;
}

/** Client-side admin session user (subset of AdminSession) */
export interface AdminSessionUser {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
}

/** Admin dashboard tab ids (URL ?tab= values) */
export type AdminServiceId = "spotify" | "youtube-music" | "apple-music";

export interface AdminServiceDefinition {
  id: AdminServiceId;
  label: string;
  /** When false, tab is visible but connection actions stay disabled */
  enabled: boolean;
  Panel: ComponentType;
}
