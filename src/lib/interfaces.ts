// Spotify Types
export interface SpotifyTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  external_urls: { spotify: string };
}

export interface CurrentlyPlayingResponse {
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

export interface SimplifiedTrack {
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  songUrl: string;
}

export interface NowPlayingPayload {
  isPlaying: boolean;
  track: SimplifiedTrack | null;
}

export interface PublicNowPlayingPayload extends NowPlayingPayload {
  timestamp: string;
}

// Database Types
export interface SpotifyCredential {
  user_id: number;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  is_active: boolean;
  last_updated: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SpotifyApiResponse extends ApiResponse<NowPlayingPayload> {
  etag?: string;
  newAccessToken?: {
    token: string;
    expiresIn: number;
  };
}

// Context Types
export interface SpotifyTokens {
  refreshToken: string | null;
  accessToken: string | null;
  accessTokenExpiry: number | null;
}

export interface SpotifyContextType {
  tokens: SpotifyTokens;
  updateRefreshToken: (token: string) => void;
  updateAccessToken: (token: string, expiresIn?: number) => void;
  clearTokens: () => void;
  hasValidAccessToken: () => boolean;
  hasRefreshToken: () => boolean;
  getTokenForAPI: () => string | null;
  loading: boolean;
  error: string | null;
}

// Hook Types
export interface UseNowPlayingReturn {
  payload: NowPlayingPayload | null;
  loading: boolean;
  error: string | null;
}

export interface UsePublicNowPlayingReturn {
  payload: PublicNowPlayingPayload | null;
  loading: boolean;
  error: string | null;
}

// Component Props Types
export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  color?: "brand" | "accent" | "neutral";
}

export interface QuickActionProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  color?: "brand" | "accent" | "neutral";
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

// Configuration Types
export interface DatabaseConfig {
  uri: string;
  name: string;
  options?: {
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    socketTimeoutMS?: number;
  };
}

export interface SpotifyConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

// Utility Types
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type LoadingState = "idle" | "loading" | "success" | "error";

export type SpotifyConnectionState = "disconnected" | "connecting" | "connected" | "error";
