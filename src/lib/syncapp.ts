import { EnvironmentUtils } from "./server-utils";

/**
 * SyncApp API configuration.
 * Posts are authored in SyncApp (client) and served via the SyncApp server.
 */
export function getSyncAppApiBase(): string {
  const envUrl = process.env.SYNCAPP_API_URL?.trim();
  if (envUrl) {
    return envUrl.endsWith("/api") ? envUrl : `${envUrl.replace(/\/$/, "")}/api`;
  }

  return EnvironmentUtils.isProduction() ? "https://sync-app-server.vercel.app/api" : "http://localhost:9000/api";
}
