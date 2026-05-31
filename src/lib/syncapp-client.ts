import { getSyncAppApiBase } from "./syncapp";

const TOKEN_CACHE_MS = 6 * 24 * 60 * 60 * 1000; // 6 days (JWT default is 7d)

let cachedLoginToken: { token: string; expiresAt: number } | null = null;

function clearLoginTokenCache(): void {
  cachedLoginToken = null;
}

/**
 * Returns a SyncApp bearer token for server-side API calls.
 *
 * Resolution order (matches Postman "SyncApp API" collection):
 * 1. SYNCAPP_API_TOKEN — use directly as Bearer token (Postman `{{token}}`)
 * 2. SYNCAPP_EMAIL + SYNCAPP_PASSWORD — POST /auth/login
 */
export async function getSyncAppAccessToken(): Promise<string | null> {
  const staticToken = process.env.SYNCAPP_API_TOKEN?.trim();
  if (staticToken) return staticToken;

  const email = process.env.SYNCAPP_EMAIL?.trim();
  const password = process.env.SYNCAPP_PASSWORD?.trim();
  if (!email || !password) return null;

  if (cachedLoginToken && Date.now() < cachedLoginToken.expiresAt) {
    return cachedLoginToken.token;
  }

  try {
    const res = await fetch(`${getSyncAppApiBase()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`SyncApp login failed: ${res.status}`);
      return null;
    }

    const json = (await res.json()) as { success?: boolean; data?: { token?: string } };
    const token = json.data?.token;
    if (!json.success || !token) return null;

    cachedLoginToken = { token, expiresAt: Date.now() + TOKEN_CACHE_MS };
    return token;
  } catch (error) {
    console.warn("SyncApp login error:", error);
    return null;
  }
}

/**
 * Authenticated fetch against the SyncApp API (Posts, Auth, etc.).
 * Falls back to unauthenticated requests when no credentials are configured.
 */
export async function syncAppFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const url = `${getSyncAppApiBase()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);

  const token = await getSyncAppAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(url, {
    ...init,
    headers,
    next: init.next ?? { revalidate: 300 },
  });

  if (response.status === 401 && token) {
    clearLoginTokenCache();
    const refreshedToken = await getSyncAppAccessToken();
    if (refreshedToken && refreshedToken !== token) {
      headers.set("Authorization", `Bearer ${refreshedToken}`);
      response = await fetch(url, {
        ...init,
        headers,
        next: init.next ?? { revalidate: 300 },
      });
    }
  }

  return response;
}
