import type { NextApiRequest } from "next";
import { AUTH_CONFIG } from "@/lib/constants";
import type { AdminSession } from "@/lib/interfaces";

/**
 * Validate the admin session cookie for Pages Router API routes.
 * Never trust client-supplied music credentials — mutate tokens only when this passes.
 */
export function requireAdminSession(req: NextApiRequest): AdminSession | null {
  const raw = req.cookies?.[AUTH_CONFIG.SESSION_COOKIE];
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AdminSession;
    if (session?.isAuthenticated && session.id && session.email) {
      return session;
    }
  } catch {
    return null;
  }

  return null;
}
