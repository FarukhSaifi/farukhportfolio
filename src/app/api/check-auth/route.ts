import { HTTP_STATUS } from "@/lib/constants";
import { ApiUtils } from "@/lib/server-utils";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

/**
 * API Route: Check Authentication Status
 *
 * Validates user authentication status by checking session cookies.
 * Returns user information if authenticated, null otherwise.
 *
 * @param request - Next.js App Router request object
 * @returns JSON response with authentication status and user data
 */
export async function GET(request: NextRequest) {
  try {
    // Parse cookies from request headers
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parse(cookieHeader);
    const authSession = cookies["auth-session"];

    // Check if session cookie exists
    if (!authSession) {
      return NextResponse.json(
        ApiUtils.createSuccessResponse({
          user: null,
          isAuthenticated: false,
        }),
        { status: HTTP_STATUS.OK },
      );
    }

    try {
      // Parse session data from cookie
      const user = JSON.parse(authSession);

      // Validate session data structure
      if (user && user.isAuthenticated && user.id && user.email) {
        return NextResponse.json(
          ApiUtils.createSuccessResponse({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
            isAuthenticated: true,
          }),
          { status: HTTP_STATUS.OK },
        );
      }
    } catch (parseError) {
      // Log parsing error for debugging
      console.error("Error parsing auth session:", parseError);
    }

    // Return unauthenticated status for invalid or expired sessions
    return NextResponse.json(
      ApiUtils.createSuccessResponse({
        user: null,
        isAuthenticated: false,
      }),
      { status: HTTP_STATUS.OK },
    );
  } catch (error: any) {
    // Log error for debugging
    console.error("Check auth error:", error);

    // Handle and return standardized error response
    const errorResponse = ApiUtils.handleApiError(error);
    return NextResponse.json(
      ApiUtils.createErrorResponse(
        errorResponse.message,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
      ),
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR },
    );
  }
}
