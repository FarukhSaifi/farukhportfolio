import { SYNCAPP_CONFIG } from "./constants/syncapp";

/**
 * SyncApp API configuration.
 * Posts are authored in SyncApp (client) and served via the SyncApp server.
 */
export function getSyncAppApiBase(): string {
  const envUrl = process.env.SYNCAPP_API_URL?.trim();
  if (envUrl) {
    return envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/$/, "")}/api`;
  }

  return SYNCAPP_CONFIG.PRODUCTION_API_BASE;
}
