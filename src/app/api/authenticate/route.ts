import { HTTP_STATUS } from "@/lib/constants";
import { ApiUtils } from "@/lib/server-utils";
import { serialize } from "cookie";
import { NextRequest, NextResponse } from "next/server";

/**
 * Mock admin credentials - in production, use proper authentication
 * TODO: Replace with proper authentication system (JWT, OAuth, etc.)
 */
const ADMIN_CREDENTIALS = {
  email: "admin@farukh.me",
  password: "admin123", // In production, use hashed passwords
};

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
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        ApiUtils.createErrorResponse(
          "Email and password are required",
          HTTP_STATUS.BAD_REQUEST,
        ),
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    // Validate input types
    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        ApiUtils.createErrorResponse(
          "Invalid credentials format",
          HTTP_STATUS.BAD_REQUEST,
        ),
        { status: HTTP_STATUS.BAD_REQUEST },
      );
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();

    // Simple authentication check - in production, use proper authentication
    if (
      sanitizedEmail === ADMIN_CREDENTIALS.email &&
      sanitizedPassword === ADMIN_CREDENTIALS.password
    ) {
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
      return NextResponse.json(
        ApiUtils.createErrorResponse(
          "Invalid credentials",
          HTTP_STATUS.UNAUTHORIZED,
        ),
        { status: HTTP_STATUS.UNAUTHORIZED },
      );
    }
  } catch (error: any) {
    // Log error for debugging
    console.error("Authentication error:", error);

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
