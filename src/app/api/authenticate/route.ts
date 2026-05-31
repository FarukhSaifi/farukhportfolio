import { HTTP_STATUS } from "@/lib/constants";
import { ApiUtils } from "@/lib/server-utils";
import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";

/**
 * Admin credentials from environment (see .env.example).
 * RouteGuard sends password only; email defaults to ADMIN_EMAIL.
 */
function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL?.trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD?.trim(),
  };
}

/**
 * API Route: Authenticate User
 *
 * Handles user authentication and session management.
 * In production, this should use proper authentication mechanisms.
 *
 * @param request - Next.js App Router request object
 * @returns JSON response with authentication status
 */
export async function POST(request: NextRequest) {
  try {
    // Extract credentials from request body
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!password || typeof password !== "string") {
      return NextResponse.json(ApiUtils.createErrorResponse("Password is required", HTTP_STATUS.BAD_REQUEST), {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    const ADMIN_CREDENTIALS = getAdminCredentials();
    const sanitizedPassword = password.trim();
    const sanitizedEmail = email?.trim().toLowerCase() || ADMIN_CREDENTIALS.email;

    // Validate email when provided explicitly
    if (email && typeof email !== "string") {
      return NextResponse.json(ApiUtils.createErrorResponse("Invalid credentials format", HTTP_STATUS.BAD_REQUEST), {
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }

    // Simple authentication check - in production, use proper authentication
    if (sanitizedEmail === ADMIN_CREDENTIALS.email && sanitizedPassword === ADMIN_CREDENTIALS.password) {
      // Create user session object
      const user = {
        id: "admin-1",
        email: ADMIN_CREDENTIALS.email,
        name: "Admin User",
        role: "admin" as const,
        isAuthenticated: true,
      };

      // Create response with success data
      const response = NextResponse.json(
        ApiUtils.createSuccessResponse(
          {
            user,
            isAuthenticated: true,
          },
          "Login successful",
        ),
        { status: HTTP_STATUS.OK },
      );

      // Set secure session cookie
      const cookieValue = serialize("auth-session", JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400, // 24 hours
        path: "/",
      });

      response.headers.set("Set-Cookie", cookieValue);

      return response;
    } else {
      return NextResponse.json(ApiUtils.createErrorResponse("Invalid credentials", HTTP_STATUS.UNAUTHORIZED), {
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }
  } catch (error: any) {
    // Log error for debugging
    console.error("Authentication error:", error);

    // Handle and return standardized error response
    const errorResponse = ApiUtils.handleApiError(error);
    return NextResponse.json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR), {
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    });
  }
}
