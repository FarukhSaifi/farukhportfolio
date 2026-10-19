import {
  DATABASE_CONFIG,
  ERROR_MESSAGES,
  HTTP_METHODS,
  HTTP_STATUS,
  LOG_MESSAGES,
  NETWORK,
  OAUTH_CONFIG,
  OAUTH_TOKEN_AUTH,
  ROUTES,
} from "@/lib/constants";
import type { MusicOAuthLifecycleConfig } from "@/lib/interfaces";
import { ApiUtils } from "@/lib/server-utils";
import { requireAdminSession } from "@/lib/spotify-admin-auth";
import { stringifySetCookie } from "cookie";
import type { NextApiRequest, NextApiResponse } from "next";

function clearPkceCookies(res: NextApiResponse, config: MusicOAuthLifecycleConfig) {
  res.setHeader(config.headers.setCookie, [
    stringifySetCookie({
      name: config.pkceCookie,
      value: "",
      path: config.cookiePath,
      maxAge: 0,
    }),
    stringifySetCookie({
      name: config.pkceStateCookie,
      value: "",
      path: config.cookiePath,
      maxAge: 0,
    }),
  ]);
}

/** Admin-only OAuth authorize redirect + PKCE cookies */
export function createAuthHandler(config: MusicOAuthLifecycleConfig) {
  return function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== HTTP_METHODS.GET) {
      res
        .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
        .json(ApiUtils.createErrorResponse(config.errors.methodNotAllowed, HTTP_STATUS.METHOD_NOT_ALLOWED));
      return;
    }

    try {
      if (!requireAdminSession(req)) {
        res.redirect(HTTP_STATUS.FOUND, ROUTES.ADMIN);
        return;
      }

      const clientId = config.getClientId();
      const redirectUri = config.getRedirectUri();

      if (config.localhostHost && config.loopbackHost) {
        const hostHeader = req.headers.host ?? "";
        const requestHost = hostHeader.split(":")[0];
        let redirectHost = "";
        try {
          redirectHost = new URL(redirectUri).hostname;
        } catch {
          redirectHost = "";
        }
        if (requestHost === config.localhostHost && redirectHost === config.loopbackHost) {
          const port = hostHeader.includes(":") ? hostHeader.split(":")[1] : NETWORK.DEFAULT_DEV_PORT;
          const path = req.url?.startsWith("/") ? req.url : `/${req.url ?? ""}`;
          res.redirect(HTTP_STATUS.FOUND, `${NETWORK.HTTP_PREFIX}${config.loopbackHost}:${port}${path}`);
          return;
        }
      }

      const { verifier, challenge, state } = config.generatePkce();
      const isSecure = redirectUri.startsWith(NETWORK.HTTPS_PREFIX);
      const cookieOptions = {
        httpOnly: true,
        secure: isSecure,
        sameSite: config.cookieSameSite,
        path: config.cookiePath,
        maxAge: config.pkceCookieMaxAge,
      };

      res.setHeader(config.headers.setCookie, [
        stringifySetCookie({ name: config.pkceCookie, value: verifier, ...cookieOptions }),
        stringifySetCookie({ name: config.pkceStateCookie, value: state, ...cookieOptions }),
      ]);

      const authUrl = new URL(config.authorizeUrl);
      authUrl.searchParams.set(config.query.clientId, clientId);
      authUrl.searchParams.set(config.query.responseType, config.responseType);
      authUrl.searchParams.set(config.query.redirectUri, redirectUri);
      authUrl.searchParams.set(config.query.scope, config.scopes.join(" "));
      authUrl.searchParams.set(config.query.state, state);
      authUrl.searchParams.set(config.query.codeChallengeMethod, config.codeChallengeMethod);
      authUrl.searchParams.set(config.query.codeChallenge, challenge);
      if (config.authQueryExtras) {
        for (const [key, value] of Object.entries(config.authQueryExtras)) {
          authUrl.searchParams.set(key, value);
        }
      }

      res.redirect(authUrl.toString());
    } catch (error: unknown) {
      console.error(LOG_MESSAGES.OAUTH_LIFECYCLE.authError(config.serviceName), error);
      const errorResponse = ApiUtils.handleApiError(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  };
}

/** Admin-only code + PKCE exchange; never returns tokens */
export function createExchangeCodeHandler(config: MusicOAuthLifecycleConfig) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== HTTP_METHODS.POST) {
      return res
        .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
        .json(ApiUtils.createErrorResponse(config.errors.methodNotAllowed, HTTP_STATUS.METHOD_NOT_ALLOWED));
    }

    try {
      if (!requireAdminSession(req)) {
        clearPkceCookies(res, config);
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(ApiUtils.createErrorResponse(config.errors.adminRequired, HTTP_STATUS.UNAUTHORIZED));
      }

      const { code, state } = req.body ?? {};
      if (!code || typeof code !== "string") {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(ApiUtils.createErrorResponse(config.errors.authCodeRequired, HTTP_STATUS.BAD_REQUEST));
      }

      const codeVerifier = req.cookies[config.pkceCookie];
      const expectedState = req.cookies[config.pkceStateCookie];

      if (!codeVerifier) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(ApiUtils.createErrorResponse(config.errors.missingPkce, HTTP_STATUS.BAD_REQUEST));
      }

      if (
        typeof expectedState !== "string" ||
        !expectedState ||
        typeof state !== "string" ||
        !state ||
        state !== expectedState
      ) {
        clearPkceCookies(res, config);
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(ApiUtils.createErrorResponse(config.errors.invalidOauthState, HTTP_STATUS.BAD_REQUEST));
      }

      const clientId = config.getClientId();
      const clientSecret = config.getClientSecret();
      const redirectUri = config.getRedirectUri();

      const body = new URLSearchParams({
        grant_type: config.grantTypeAuthorizationCode,
        code: code.trim(),
        redirect_uri: redirectUri,
        client_id: clientId,
        code_verifier: codeVerifier,
      });

      const headers: Record<string, string> = {
        [config.headers.contentType]: config.headers.formUrlEncoded,
      };

      if (config.tokenAuth === OAUTH_TOKEN_AUTH.BASIC) {
        headers[config.headers.authorization] =
          `${OAUTH_CONFIG.BASIC_AUTH_PREFIX}${Buffer.from(`${clientId}:${clientSecret}`).toString(OAUTH_CONFIG.BASE64_ENCODING)}`;
      } else {
        body.set(config.query.clientSecret || OAUTH_CONFIG.DEFAULT_CLIENT_SECRET_PARAM, clientSecret);
      }

      const tokenResponse = await fetch(config.tokenUrl, {
        method: HTTP_METHODS.POST,
        headers,
        body,
      });

      if (!tokenResponse.ok) {
        console.error(LOG_MESSAGES.OAUTH_LIFECYCLE.tokenExchangeFailed(config.serviceName), tokenResponse.status);
        clearPkceCookies(res, config);
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(ApiUtils.createErrorResponse(config.errors.exchangeFailed, HTTP_STATUS.BAD_REQUEST));
      }

      const tokenData = await tokenResponse.json();
      if (!tokenData.access_token) {
        clearPkceCookies(res, config);
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(ApiUtils.createErrorResponse(config.errors.invalidTokenResponse, HTTP_STATUS.BAD_REQUEST));
      }

      let refreshToken = typeof tokenData.refresh_token === "string" ? tokenData.refresh_token : "";
      if (!refreshToken && config.allowMissingRefreshToken) {
        const existing = await config.getToken();
        refreshToken = existing.data?.refresh_token || "";
      }

      if (!refreshToken) {
        clearPkceCookies(res, config);
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(ApiUtils.createErrorResponse(config.errors.invalidTokenResponse, HTTP_STATUS.BAD_REQUEST));
      }

      const tokenPayload = {
        user_id: DATABASE_CONFIG.USER_IDS.PUBLIC,
        access_token: tokenData.access_token as string,
        refresh_token: refreshToken,
        expires_in: tokenData.expires_in || config.defaultExpiresIn,
        token_type: tokenData.token_type || config.defaultTokenType,
        is_active: true,
      };

      let saveResult = await config.saveToken(tokenPayload);
      if (!saveResult.success) {
        saveResult = await config.saveToken(tokenPayload);
      }

      if (!saveResult.success) {
        return res
          .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .json(
            ApiUtils.createErrorResponse(
              saveResult.error || config.errors.saveFailed,
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ),
          );
      }

      clearPkceCookies(res, config);
      return res
        .status(HTTP_STATUS.OK)
        .json(ApiUtils.createSuccessResponse({ isConnected: true }, config.success.connected));
    } catch (error: unknown) {
      console.error(LOG_MESSAGES.OAUTH_LIFECYCLE.tokenExchangeError(config.serviceName), error);
      const errorResponse = ApiUtils.handleApiError(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  };
}

/** Public connection status only — never returns secrets */
export function createGetTokenHandler(config: MusicOAuthLifecycleConfig) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== HTTP_METHODS.GET) {
      return res
        .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
        .json(ApiUtils.createErrorResponse(config.errors.methodNotAllowed, HTTP_STATUS.METHOD_NOT_ALLOWED));
    }

    try {
      const isConnected = await config.isConnected();
      return res
        .status(HTTP_STATUS.OK)
        .json(
          ApiUtils.createSuccessResponse(
            { isConnected },
            isConnected ? config.success.isConnected : config.success.notConnected,
          ),
        );
    } catch (error: unknown) {
      console.error(LOG_MESSAGES.OAUTH_LIFECYCLE.getTokenError(config.serviceName), error);
      if (error instanceof Error && error.message === ERROR_MESSAGES.DATABASE.CONNECTION_FAILED) {
        return res
          .status(HTTP_STATUS.SERVICE_UNAVAILABLE)
          .json(ApiUtils.createErrorResponse(ERROR_MESSAGES.DATABASE.FETCH_FAILED, HTTP_STATUS.SERVICE_UNAVAILABLE));
      }
      const errorResponse = ApiUtils.handleApiError(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  };
}

/** Admin-only refresh from stored refresh_token */
export function createRefreshTokenHandler(config: MusicOAuthLifecycleConfig) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== HTTP_METHODS.POST) {
      return res
        .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
        .json(ApiUtils.createErrorResponse(config.errors.methodNotAllowed, HTTP_STATUS.METHOD_NOT_ALLOWED));
    }

    try {
      if (!requireAdminSession(req)) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(ApiUtils.createErrorResponse(config.errors.adminRequiredShort, HTTP_STATUS.UNAUTHORIZED));
      }

      const tokenResult = await config.getToken();
      if (!tokenResult.success || !tokenResult.data?.refresh_token) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json(ApiUtils.createErrorResponse(config.errors.noActiveToken, HTTP_STATUS.NOT_FOUND));
      }

      const refreshResult = await config.refreshAccessToken(tokenResult.data.refresh_token);
      if (!refreshResult) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(ApiUtils.createErrorResponse(config.errors.refreshFailed, HTTP_STATUS.UNAUTHORIZED));
      }

      const updateResult = await config.updateToken(refreshResult);
      if (!updateResult.success) {
        return res
          .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .json(ApiUtils.createErrorResponse(config.errors.persistRefreshFailed, HTTP_STATUS.INTERNAL_SERVER_ERROR));
      }

      return res
        .status(HTTP_STATUS.OK)
        .json(ApiUtils.createSuccessResponse({ refreshed: true }, config.success.refreshed));
    } catch (error: unknown) {
      console.error(LOG_MESSAGES.OAUTH_LIFECYCLE.refreshError(config.serviceName), error);
      const errorResponse = ApiUtils.handleApiError(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  };
}

/** Admin-only disconnect (DELETE) */
export function createDisconnectHandler(config: MusicOAuthLifecycleConfig) {
  return async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === HTTP_METHODS.POST && config.rejectPostDisconnectMessage) {
      return res
        .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
        .json(ApiUtils.createErrorResponse(config.rejectPostDisconnectMessage, HTTP_STATUS.METHOD_NOT_ALLOWED));
    }

    if (req.method !== HTTP_METHODS.DELETE) {
      return res
        .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
        .json(ApiUtils.createErrorResponse(config.errors.methodNotAllowed, HTTP_STATUS.METHOD_NOT_ALLOWED));
    }

    try {
      if (!requireAdminSession(req)) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .json(ApiUtils.createErrorResponse(config.errors.adminRequiredShort, HTTP_STATUS.UNAUTHORIZED));
      }

      const result = await config.deactivateToken();
      if (!result.success) {
        return res
          .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
          .json(
            ApiUtils.createErrorResponse(
              result.error || config.errors.disconnectFailed,
              HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ),
          );
      }

      return res
        .status(HTTP_STATUS.OK)
        .json(ApiUtils.createSuccessResponse({ isConnected: false }, config.success.disconnected));
    } catch (error: unknown) {
      console.error(LOG_MESSAGES.OAUTH_LIFECYCLE.disconnectError(config.serviceName), error);
      const apiError = ApiUtils.handleApiError(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(ApiUtils.createErrorResponse(apiError.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
    }
  };
}
