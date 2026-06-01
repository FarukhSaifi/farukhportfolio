export const SYNCAPP_CONFIG = {
  PRODUCTION_API_BASE: "https://sync-app-server.vercel.app/api",
  /** JWT default is 7d; refresh cache slightly earlier. */
  TOKEN_CACHE_MS: 6 * 24 * 60 * 60 * 1000,
  FETCH_REVALIDATE_SECONDS: 300,
} as const;
