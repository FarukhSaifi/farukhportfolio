import { HTTP_STATUS } from "@/lib/constants";
import { ApiUtils } from "@/lib/server-utils";
import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

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
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @returns JSON response with authentication status
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== "POST") {
    return res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse("Method not allowed", HTTP_STATUS.METHOD_NOT_ALLOWED));
  }

  try {
    // Extract credentials from request body
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiUtils.createErrorResponse("Email and password are required", HTTP_STATUS.BAD_REQUEST));
    }

    // Validate input types
    if (typeof email !== "string" || typeof password !== "string") {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(ApiUtils.createErrorResponse("Invalid credentials format", HTTP_STATUS.BAD_REQUEST));
    }

    // Sanitize inputs
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();

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

      // Set secure session cookie
      res.setHeader(
        "Set-Cookie",
        serialize("auth-session", JSON.stringify(user), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 86400, // 24 hours
          path: "/",
        })
      );

      return res.status(HTTP_STATUS.OK).json(
        ApiUtils.createSuccessResponse(
          {
            user,
            isAuthenticated: true,
          },
          "Login successful"
        )
      );
    } else {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json(ApiUtils.createErrorResponse("Invalid credentials", HTTP_STATUS.UNAUTHORIZED));
    }
  } catch (error: any) {
    // Log error for debugging
    console.error("Authentication error:", error);

    // Handle and return standardized error response
    const errorResponse = ApiUtils.handleApiError(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
