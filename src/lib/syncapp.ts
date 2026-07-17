import { SYNCAPP_CONFIG } from "./constants/syncapp";

/**
 * SyncApp API configuration.
 * Posts are authored in SyncApp (client) and served via the SyncApp server.
 */
export function getSyncAppApiBase(): string {
  const envUrl = process.env.SYNCAPP_API_URL?.trim();
  if (envUrl) {
    const normalized = envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/$/, "")}/api`;
    const isLocalhost = /localhost|127\.0\.0\.1/i.test(normalized);
    if (isLocalhost && process.env.NODE_ENV === "production") {
      console.warn("SYNCAPP_API_URL points to localhost in production; using default API base instead.");
      return SYNCAPP_CONFIG.PRODUCTION_API_BASE;
    }
    return normalized;
  }

  return SYNCAPP_CONFIG.PRODUCTION_API_BASE;
}
