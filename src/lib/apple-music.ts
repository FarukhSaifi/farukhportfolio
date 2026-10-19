import {
  APPLE_MUSIC_CONFIG,
  DATABASE_CONFIG,
  ERROR_MESSAGES,
  HTTP_METHODS,
  HTTP_STATUS,
  LOG_MESSAGES,
} from "@/lib/constants";
import { databaseService } from "@/lib/database";
import type { NowPlayingPayload, PublicNowPlayingPayload, SimplifiedTrack } from "@/lib/interfaces";
import { importPKCS8, SignJWT } from "jose";

function emptyPayload(): NowPlayingPayload {
  return { isPlaying: false, isLastPlayed: false, track: null };
}

function getMusicKitTeamId(): string {
  const value = process.env.MUSIC_KIT_TEAM_ID?.trim();
  if (!value) throw new Error(ERROR_MESSAGES.APPLE_MUSIC.TEAM_ID_REQUIRED);
  return value;
}

function getMusicKitKeyId(): string {
  const value = process.env.MUSIC_KIT_KEY_ID?.trim();
  if (!value) throw new Error(ERROR_MESSAGES.APPLE_MUSIC.KEY_ID_REQUIRED);
  return value;
}

function getMusicKitPrivateKeyPem(): string {
  const raw = process.env.MUSIC_KIT_PRIVATE_KEY?.trim();
  if (!raw) throw new Error(ERROR_MESSAGES.APPLE_MUSIC.PRIVATE_KEY_REQUIRED);
  return raw.replace(/\\n/g, "\n");
}

export function getMusicKitId(): string {
  const value = process.env.MUSIC_KIT_ID?.trim();
  if (!value) throw new Error(ERROR_MESSAGES.APPLE_MUSIC.MUSIC_KIT_ID_REQUIRED);
  return value;
}

/** Create a short-lived MusicKit developer JWT (ES256). */
export async function createAppleMusicDeveloperToken(): Promise<string> {
  try {
    const privateKey = await importPKCS8(getMusicKitPrivateKeyPem(), APPLE_MUSIC_CONFIG.JWT_ALGORITHM);
    const now = Math.floor(Date.now() / 1000);
    return await new SignJWT({})
      .setProtectedHeader({ alg: APPLE_MUSIC_CONFIG.JWT_ALGORITHM, kid: getMusicKitKeyId() })
      .setIssuer(getMusicKitTeamId())
      .setIssuedAt(now)
      .setExpirationTime(now + APPLE_MUSIC_CONFIG.DEVELOPER_TOKEN_TTL_SECONDS)
      .sign(privateKey);
  } catch (error) {
    console.error(LOG_MESSAGES.APPLE_MUSIC.DEVELOPER_TOKEN_SIGN_FAILED, error);
    throw new Error(ERROR_MESSAGES.APPLE_MUSIC.DEVELOPER_TOKEN_FAILED);
  }
}

async function appleMusicGet(path: string, developerToken: string, userToken: string) {
  const url = `${APPLE_MUSIC_CONFIG.API_BASE_URL}${path}`;
  return fetch(url, {
    method: HTTP_METHODS.GET,
    headers: {
      [APPLE_MUSIC_CONFIG.HEADERS.AUTHORIZATION]: `${APPLE_MUSIC_CONFIG.DEFAULT_TOKEN_TYPE} ${developerToken}`,
      [APPLE_MUSIC_CONFIG.HEADERS.MUSIC_USER_TOKEN]: userToken,
    },
  });
}

function artworkUrl(template: string | undefined, size = APPLE_MUSIC_CONFIG.ARTWORK_SIZE): string {
  if (!template) {
    return "";
  }
  return template
    .replace(APPLE_MUSIC_CONFIG.ARTWORK_WIDTH_TOKEN, String(size))
    .replace(APPLE_MUSIC_CONFIG.ARTWORK_HEIGHT_TOKEN, String(size));
}

/**
 * Fetch the most recent recently-played track.
 * Apple Music has no official live now-playing endpoint for public display.
 */
async function fetchRecentlyPlayedTrack(
  developerToken: string,
  userToken: string,
): Promise<(SimplifiedTrack & { trackId: string }) | null> {
  const response = await appleMusicGet(
    `${APPLE_MUSIC_CONFIG.RECENTLY_PLAYED_PATH}?limit=${APPLE_MUSIC_CONFIG.RECENTLY_PLAYED_LIMIT}`,
    developerToken,
    userToken,
  );

  if (!response.ok) {
    console.warn(LOG_MESSAGES.APPLE_MUSIC.RECENTLY_PLAYED_UNAVAILABLE, response.status);
    return null;
  }

  const data = await response.json();
  const item = data?.data?.[0];
  if (!item) {
    return null;
  }

  const attributes = item.attributes || {};
  const trackId = typeof item.id === "string" ? item.id : "";
  const title = attributes.name || APPLE_MUSIC_CONFIG.UNKNOWN_TRACK;
  const artist = attributes.artistName || APPLE_MUSIC_CONFIG.ALBUM_LABEL;
  const album = attributes.albumName || APPLE_MUSIC_CONFIG.ALBUM_LABEL;
  const imageUrl = artworkUrl(attributes.artwork?.url);
  const songUrl =
    typeof attributes.url === "string" && attributes.url
      ? attributes.url
      : trackId
        ? `${APPLE_MUSIC_CONFIG.CATALOG_BASE_URL}${APPLE_MUSIC_CONFIG.SONG_PATH_PREFIX}${trackId}`
        : APPLE_MUSIC_CONFIG.CATALOG_BASE_URL;

  return {
    trackId: trackId || title,
    title,
    artist,
    album,
    imageUrl,
    songUrl,
  };
}

/** Validate that a stored Music User Token can still call the API. */
export async function validateAppleMusicUserToken(userToken: string): Promise<boolean> {
  try {
    const developerToken = await createAppleMusicDeveloperToken();
    const response = await appleMusicGet(
      `${APPLE_MUSIC_CONFIG.RECENTLY_PLAYED_PATH}?limit=${APPLE_MUSIC_CONFIG.RECENTLY_PLAYED_LIMIT}`,
      developerToken,
      userToken,
    );
    return response.ok || response.status === HTTP_STATUS.NO_CONTENT;
  } catch {
    return false;
  }
}

/**
 * Public metadata payload for visitors.
 * Approximation via recently played (+ last-played fallback). Never includes tokens.
 */
export async function getPublicAppleMusicNowPlayingPayload(): Promise<PublicNowPlayingPayload> {
  const tokenResult = await databaseService.getAppleMusicToken();
  const userToken = tokenResult.data?.access_token;

  if (userToken) {
    try {
      const developerToken = await createAppleMusicDeveloperToken();
      const recent = await fetchRecentlyPlayedTrack(developerToken, userToken);
      if (recent) {
        await databaseService.saveMusicLastPlayed(DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC, {
          ...recent,
          externalId: recent.trackId,
        });
        return {
          // Official API cannot confirm live playback — treat as recent/last-played
          isPlaying: false,
          isLastPlayed: true,
          track: {
            title: recent.title,
            artist: recent.artist,
            album: recent.album,
            imageUrl: recent.imageUrl,
            songUrl: recent.songUrl,
          },
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error(LOG_MESSAGES.APPLE_MUSIC.PUBLIC_NOW_PLAYING_FAILED, error);
    }
  }

  const last = await databaseService.getMusicLastPlayed(DATABASE_CONFIG.MUSIC_SERVICES.APPLE_MUSIC);
  if (last) {
    return {
      isPlaying: false,
      isLastPlayed: true,
      track: {
        title: last.title,
        artist: last.artist,
        album: last.album,
        imageUrl: last.imageUrl,
        songUrl: last.songUrl,
      },
      timestamp: last.playedAt instanceof Date ? last.playedAt.toISOString() : new Date(last.playedAt).toISOString(),
    };
  }

  return {
    ...emptyPayload(),
    timestamp: new Date().toISOString(),
  };
}
