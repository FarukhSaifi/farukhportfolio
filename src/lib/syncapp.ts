const PRODUCTION_SYNCAPP_API = "https://sync-app-server.vercel.app/api";

/**
 * SyncApp API configuration.
 * Posts are authored in SyncApp (client) and served via the SyncApp server.
 */
export function getSyncAppApiBase(): string {
  const envUrl = process.env.SYNCAPP_API_URL?.trim();
  if (envUrl) {
    return envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/$/, "")}/api`;
  }

  return PRODUCTION_SYNCAPP_API;
}
