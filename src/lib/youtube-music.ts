import { ERROR_MESSAGES, HTTP_METHODS, LOG_MESSAGES, YOUTUBE_MUSIC_CONFIG } from "@/lib/constants";
import type { OAuthTokenRefreshResult } from "@/lib/interfaces";
import { EnvironmentUtils, SpotifyUtils } from "@/lib/server-utils";

export function getYoutubeMusicClientId(): string {
  const clientId = process.env.YOUTUBE_MUSIC_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error(ERROR_MESSAGES.YOUTUBE_MUSIC.CLIENT_ID_REQUIRED);
  }
  return clientId;
}

export function getYoutubeMusicClientSecret(): string {
  const clientSecret = process.env.YOUTUBE_MUSIC_CLIENT_SECRET?.trim();
  if (!clientSecret) {
    throw new Error(ERROR_MESSAGES.YOUTUBE_MUSIC.CLIENT_SECRET_REQUIRED);
  }
  return clientSecret;
}

export function getYoutubeMusicRedirectUri(): string {
  const override = process.env.YOUTUBE_MUSIC_REDIRECT_URI?.trim();
  if (override) {
    return override;
  }
  return EnvironmentUtils.isProduction()
    ? YOUTUBE_MUSIC_CONFIG.REDIRECT_URI.PRODUCTION
    : YOUTUBE_MUSIC_CONFIG.REDIRECT_URI.DEVELOPMENT;
}

export function generateYoutubeMusicPkce(): { verifier: string; challenge: string; state: string } {
  const verifier = SpotifyUtils.generateCodeVerifier(YOUTUBE_MUSIC_CONFIG.PKCE_VERIFIER_LENGTH);
  return {
    verifier,
    challenge: SpotifyUtils.createCodeChallenge(verifier),
    state: SpotifyUtils.generateOAuthState(),
  };
}

export async function refreshYoutubeMusicAccessToken(refreshToken: string): Promise<OAuthTokenRefreshResult | null> {
  try {
    const response = await fetch(YOUTUBE_MUSIC_CONFIG.TOKEN_URL, {
      method: HTTP_METHODS.POST,
      headers: {
        [YOUTUBE_MUSIC_CONFIG.HEADERS.CONTENT_TYPE]: YOUTUBE_MUSIC_CONFIG.HEADERS.FORM_URLENCODED,
      },
      body: new URLSearchParams({
        client_id: getYoutubeMusicClientId(),
        client_secret: getYoutubeMusicClientSecret(),
        grant_type: YOUTUBE_MUSIC_CONFIG.GRANT_TYPE.REFRESH_TOKEN,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error(LOG_MESSAGES.YOUTUBE_MUSIC.REFRESH_TOKEN_FAILED, response.status);
      return null;
    }

    const data = await response.json();
    if (!data.access_token) {
      return null;
    }

    return {
      access_token: data.access_token as string,
      expires_in: data.expires_in || YOUTUBE_MUSIC_CONFIG.DEFAULT_EXPIRES_IN,
      token_type: data.token_type || YOUTUBE_MUSIC_CONFIG.DEFAULT_TOKEN_TYPE,
    };
  } catch (error) {
    console.error(LOG_MESSAGES.YOUTUBE_MUSIC.REFRESH_TOKEN_ERROR, error);
    return null;
  }
}
