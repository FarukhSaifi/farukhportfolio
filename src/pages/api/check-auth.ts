import { HTTP_STATUS } from "@/lib/constants";
import { ApiUtils } from "@/lib/server-utils";
import { parse } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * API Route: Check Authentication Status
 *
 * Validates user authentication status by checking session cookies.
 * Returns user information if authenticated, null otherwise.
 *
 * @param req - Next.js API request object
 * @param res - Next.js API response object
 * @returns JSON response with authentication status and user data
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Validate HTTP method
  if (req.method !== "GET") {
    return res
      .status(HTTP_STATUS.METHOD_NOT_ALLOWED)
      .json(ApiUtils.createErrorResponse("Method not allowed", HTTP_STATUS.METHOD_NOT_ALLOWED));
  }

  try {
    // Parse cookies from request headers
    const cookies = parse(req.headers.cookie || "");
    const authSession = cookies["auth-session"];

    // Check if session cookie exists
    if (!authSession) {
      return res.status(HTTP_STATUS.OK).json(
        ApiUtils.createSuccessResponse({
          user: null,
          isAuthenticated: false,
        })
      );
    }

    try {
      // Parse session data from cookie
      const user = JSON.parse(authSession);

      // Validate session data structure
      if (user && user.isAuthenticated && user.id && user.email) {
        return res.status(HTTP_STATUS.OK).json(
          ApiUtils.createSuccessResponse({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
            isAuthenticated: true,
          })
        );
      }
    } catch (parseError) {
      // Log parsing error for debugging
      console.error("Error parsing auth session:", parseError);
    }

    // Return unauthenticated status for invalid or expired sessions
    return res.status(HTTP_STATUS.OK).json(
      ApiUtils.createSuccessResponse({
        user: null,
        isAuthenticated: false,
      })
    );
  } catch (error: any) {
    // Log error for debugging
    console.error("Check auth error:", error);

    // Handle and return standardized error response
    const errorResponse = ApiUtils.handleApiError(error);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(ApiUtils.createErrorResponse(errorResponse.message, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
}
