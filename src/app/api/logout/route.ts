import { NextResponse } from "next/server";
import { AUTH_CONFIG, HTTP_STATUS } from "@/lib/constants";
import { ApiUtils, EnvironmentUtils } from "@/lib/server-utils";

/**
 * Clear the admin session cookie.
 */
export async function POST() {
  const response = NextResponse.json(
    ApiUtils.createSuccessResponse({ isAuthenticated: false }, "Signed out"),
    { status: HTTP_STATUS.OK },
  );

  response.cookies.set(AUTH_CONFIG.SESSION_COOKIE, "", {
    httpOnly: true,
    secure: EnvironmentUtils.isProduction(),
    sameSite: AUTH_CONFIG.SAME_SITE,
    maxAge: 0,
    path: AUTH_CONFIG.COOKIE_PATH,
  });

  return response;
}
