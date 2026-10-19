import {
  createAppleMusicDeveloperToken,
  getMusicKitId,
  getPublicAppleMusicNowPlayingPayload,
  validateAppleMusicUserToken,
} from "@/lib/apple-music";
import {
  APPLE_MUSIC_CONFIG,
  DATABASE_CONFIG,
  ERROR_MESSAGES,
  HTTP_METHODS,
  HTTP_STATUS,
  LOG_MESSAGES,
  MUSIC_AGGREGATE_SERVICE,
  MUSIC_SERVICE_QUERY,
  SPOTIFY_CONFIG,
  SUCCESS_MESSAGES,
} from "@/lib/constants";
import { databaseService } from "@/lib/database";
import type { MusicOAuthLifecycleConfig, MusicServiceId } from "@/lib/interfaces";
import { getPriorityPublicNowPlayingPayload } from "@/lib/music-now-playing-priority";
import { MUSIC_OAUTH_LIFECYCLES } from "@/lib/music-oauth-services";
import { enforcePublicNowPlayingRateLimit, sanitizePublicNowPlayingPayload } from "@/lib/public-now-playing-safe";
import { ApiUtils } from "@/lib/server-utils";
import { requireAdminSession } from "@/lib/spotify-admin-auth";
import { getPublicNowPlayingPayload } from "@/lib/spotify-now-playing";
import type { NextApiRequest, NextApiResponse } from "next";

const MUSIC_SERVICE_IDS = new Set<string>(Object.values(DATABASE_CONFIG.MUSIC_SERVICES));

/** Raw `service` query/body value (may be a concrete service or `all`) */
function readMusicServiceParam(req: NextApiRequest): string {
  const rawQuery = req.query[MUSIC_SERVICE_QUERY];
  const fromQuery = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;
  const fromBody =
    req.body && typeof req.body === "object" && typeof (req.body as { service?: unknown }).service === "string"
      ? (req.body as { service: string }).service
      : undefined;
  return (fromQuery || fromBody || "").trim();
}

/** Read `service` from query string or JSON body */
function resolveMusicServiceId(req: NextApiRequest): MusicServiceId | null {
  const raw = readMusicServiceParam(req);
  if (!MUSIC_SERVICE_IDS.has(raw)) {
    return null;
  }
  return raw as MusicServiceId;
}

export function isMusicAggregateServiceParam(req: NextApiRequest): boolean {
  const raw = readMusicServiceParam(req);
  return raw === "" || raw === MUSIC_AGGREGATE_SERVICE;
}

/** Resolve service or write a 400 and return null */
export function requireMusicServiceId(req: NextApiRequest, res: NextApiResponse): MusicServiceId | null {
  const service = resolveMusicServiceId(req);
  if (!service) {
    res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.MUSIC.INVALID_SERVICE, HTTP_STATUS.BAD_REQUEST));
    return null;
  }
  return service;
}

export function getOAuthLifecycle(service: MusicServiceId): MusicOAuthLifecycleConfig | null {
  return MUSIC_OAUTH_LIFECYCLES[service] ?? null;
}

/** Apple MusicKit developer-token bootstrap (admin GET) */
export async function handleAppleMusicAuth(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== HTTP_METHODS.GET) {
    res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(
        ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.METHOD_NOT_ALLOWED, HTTP_STATUS.METHOD_NOT_ALLOWED),
      );
    return;
  }

  try {
    if (!requireAdminSession(req)) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.ADMIN_REQUIRED, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const developerToken = await createAppleMusicDeveloperToken();
    const musicKitId = getMusicKitId();

    res.status(HTTP_STATUS.OK).json(
      ApiUtils.createSuccessResponse(
        {
          developerToken,
          musicKitId,
        },
        SUCCESS_MESSAGES.APPLE_MUSIC.IS_CONNECTED,
      ),
    );
  } catch (error: unknown) {
    console.error(LOG_MESSAGES.MUSIC_API.APPLE_AUTH_ERROR, error);
    const errorResponse = ApiUtils.handleApiError(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}

/** Store Music User Token from MusicKit.authorize() (admin POST) */
export async function handleAppleMusicExchangeCode(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== HTTP_METHODS.POST) {
    res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(
        ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.METHOD_NOT_ALLOWED, HTTP_STATUS.METHOD_NOT_ALLOWED),
      );
    return;
  }

  try {
    if (!requireAdminSession(req)) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.ADMIN_REQUIRED, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const { userToken } = req.body ?? {};

    if (!userToken || typeof userToken !== "string" || !userToken.trim()) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.USER_TOKEN_REQUIRED, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    const trimmed = userToken.trim();
    const isValid = await validateAppleMusicUserToken(trimmed);
    if (!isValid) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.AUTH_FAILED, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    const saveResult = await databaseService.saveAppleMusicToken({
      user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
      access_token: trimmed,
      refresh_token: APPLE_MUSIC_CONFIG.USER_TOKEN_SENTINEL,
      expires_in: APPLE_MUSIC_CONFIG.DEFAULT_EXPIRES_IN,
      token_type: APPLE_MUSIC_CONFIG.DEFAULT_TOKEN_TYPE,
      is_active: true,
    });

    if (!saveResult.success) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          ApiUtils.createErrorResponse(
            saveResult.error || ERROR_MESSAGES.APPLE_MUSIC.SAVE_FAILED,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ),
        );
      return;
    }

    res
      .status(HTTP_STATUS.OK)
      .json(ApiUtils.createSuccessResponse({ isConnected: true }, SUCCESS_MESSAGES.APPLE_MUSIC.CONNECTED));
  } catch (error: unknown) {
    console.error(LOG_MESSAGES.MUSIC_API.APPLE_EXCHANGE_ERROR, error);
    const errorResponse = ApiUtils.handleApiError(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}

/** Public-safe Apple Music connection status */
export async function handleAppleMusicGetToken(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== HTTP_METHODS.GET) {
    res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(
        ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.METHOD_NOT_ALLOWED, HTTP_STATUS.METHOD_NOT_ALLOWED),
      );
    return;
  }

  try {
    const isConnected = await databaseService.isAppleMusicConnected();

    res
      .status(HTTP_STATUS.OK)
      .json(
        ApiUtils.createSuccessResponse(
          { isConnected },
          isConnected ? SUCCESS_MESSAGES.APPLE_MUSIC.IS_CONNECTED : SUCCESS_MESSAGES.APPLE_MUSIC.NOT_CONNECTED,
        ),
      );
  } catch (error: unknown) {
    console.error(LOG_MESSAGES.MUSIC_API.APPLE_GET_TOKEN_ERROR, error);
    if (error instanceof Error && error.message === ERROR_MESSAGES.DATABASE.CONNECTION_FAILED) {
      res
        .status(HTTP_STATUS.SERVICE_UNAVAILABLE)
        .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.DATABASE.FETCH_FAILED, HTTP_STATUS.SERVICE_UNAVAILABLE));
      return;
    }
    const errorResponse = ApiUtils.handleApiError(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}

/** Revalidate stored Music User Token (admin POST) */
export async function handleAppleMusicRefreshToken(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== HTTP_METHODS.POST) {
    res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(
        ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.METHOD_NOT_ALLOWED, HTTP_STATUS.METHOD_NOT_ALLOWED),
      );
    return;
  }

  try {
    if (!requireAdminSession(req)) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.ADMIN_REQUIRED_SHORT, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const tokenResult = await databaseService.getAppleMusicToken();
    if (!tokenResult.success || !tokenResult.data?.access_token) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.NO_ACTIVE_TOKEN, HTTP_STATUS.NOT_FOUND));
      return;
    }

    const isValid = await validateAppleMusicUserToken(tokenResult.data.access_token);
    if (!isValid) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.REFRESH_FAILED, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const updateResult = await databaseService.updateAppleMusicToken({
      access_token: tokenResult.data.access_token,
      expires_in: APPLE_MUSIC_CONFIG.DEFAULT_EXPIRES_IN,
      token_type: tokenResult.data.token_type || APPLE_MUSIC_CONFIG.DEFAULT_TOKEN_TYPE,
    });

    if (!updateResult.success) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.SAVE_FAILED, HTTP_STATUS.INTERNAL_SERVER_ERROR));
      return;
    }

    res
      .status(HTTP_STATUS.OK)
      .json(ApiUtils.createSuccessResponse({ refreshed: true }, SUCCESS_MESSAGES.APPLE_MUSIC.REFRESHED));
  } catch (error: unknown) {
    console.error(LOG_MESSAGES.MUSIC_API.APPLE_REFRESH_ERROR, error);
    const errorResponse = ApiUtils.handleApiError(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}

/** Admin disconnect Apple Music (DELETE) */
export async function handleAppleMusicDisconnect(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== HTTP_METHODS.DELETE) {
    res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(
        ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.METHOD_NOT_ALLOWED, HTTP_STATUS.METHOD_NOT_ALLOWED),
      );
    return;
  }

  try {
    if (!requireAdminSession(req)) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.APPLE_MUSIC.ADMIN_REQUIRED_SHORT, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const result = await databaseService.deactivateAppleMusicToken();
    if (!result.success) {
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          ApiUtils.createErrorResponse(
            result.error || ERROR_MESSAGES.APPLE_MUSIC.DISCONNECT_FAILED,
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ),
        );
      return;
    }

    res
      .status(HTTP_STATUS.OK)
      .json(ApiUtils.createSuccessResponse({ isConnected: false }, SUCCESS_MESSAGES.APPLE_MUSIC.DISCONNECTED));
  } catch (error: unknown) {
    console.error(LOG_MESSAGES.MUSIC_API.APPLE_DISCONNECT_ERROR, error);
    const apiError = ApiUtils.handleApiError(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(apiError.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}

/** Aggregate public now-playing: Spotify live → freshest last-played (`service=all` or omitted) */
export async function handlePriorityPublicNowPlaying(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== HTTP_METHODS.GET) {
    res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.MUSIC.METHOD_NOT_ALLOWED, HTTP_STATUS.METHOD_NOT_ALLOWED));
    return;
  }

  if (!enforcePublicNowPlayingRateLimit(req, res)) {
    return;
  }

  try {
    const response = sanitizePublicNowPlayingPayload(await getPriorityPublicNowPlayingPayload());
    res.setHeader(SPOTIFY_CONFIG.HEADERS.CACHE_CONTROL, SPOTIFY_CONFIG.NOW_PLAYING_CACHE_CONTROL);
    res.status(HTTP_STATUS.OK).json(ApiUtils.createSuccessResponse(response));
  } catch (error: unknown) {
    console.error(LOG_MESSAGES.MUSIC_API.PRIORITY_PUBLIC_NOW_PLAYING_ERROR, error);
    const errorResponse = ApiUtils.handleApiError(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}

/** Public sanitized now-playing / last-played for any music service */
export async function handlePublicNowPlaying(
  req: NextApiRequest,
  res: NextApiResponse,
  service: MusicServiceId,
): Promise<void> {
  if (req.method !== HTTP_METHODS.GET) {
    res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.MUSIC.METHOD_NOT_ALLOWED, HTTP_STATUS.METHOD_NOT_ALLOWED));
    return;
  }

  if (!enforcePublicNowPlayingRateLimit(req, res)) {
    return;
  }

  try {
    if (service === DATABASE_CONFIG.MUSIC_SERVICES.SPOTIFY) {
      const response = sanitizePublicNowPlayingPayload(await getPublicNowPlayingPayload());
      res.setHeader(SPOTIFY_CONFIG.HEADERS.CACHE_CONTROL, SPOTIFY_CONFIG.NOW_PLAYING_CACHE_CONTROL);
      res.status(HTTP_STATUS.OK).json(ApiUtils.createSuccessResponse(response));
      return;
    }

    if (service === DATABASE_CONFIG.MUSIC_SERVICES.YOUTUBE_MUSIC) {
      // OAuth credentials are stored for future use; no official now-playing / history feed.
      const response = sanitizePublicNowPlayingPayload({
        isPlaying: false,
        isLastPlayed: false,
        track: null,
        timestamp: new Date().toISOString(),
      });
      res.setHeader(SPOTIFY_CONFIG.HEADERS.CACHE_CONTROL, SPOTIFY_CONFIG.NOW_PLAYING_CACHE_CONTROL);
      res.status(HTTP_STATUS.OK).json(ApiUtils.createSuccessResponse(response));
      return;
    }

    const response = sanitizePublicNowPlayingPayload(await getPublicAppleMusicNowPlayingPayload());
    res.setHeader(APPLE_MUSIC_CONFIG.HEADERS.CACHE_CONTROL, APPLE_MUSIC_CONFIG.NOW_PLAYING_CACHE_CONTROL);
    res.status(HTTP_STATUS.OK).json(ApiUtils.createSuccessResponse(response));
  } catch (error: unknown) {
    console.error(LOG_MESSAGES.MUSIC_API.publicNowPlayingError(service), error);
    const errorResponse = ApiUtils.handleApiError(error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
