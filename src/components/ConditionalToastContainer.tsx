"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "./ToastContainer";

/**
 * Conditional Toast Container
 *
 * Only renders the ToastNotificationContainer when the user is authenticated.
 * This prevents showing toast notifications to unauthenticated users.
 */
export default function ConditionalToastContainer() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    /**
     * Check authentication status
     *
     * Fetches the current authentication status from the API
     * to determine if toast notifications should be shown.
     */
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/check-auth");
        const data = await response.json();
        setIsAuthenticated(data.success && data.data?.isAuthenticated);
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Don't render anything while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  // Only render ToastNotificationContainer for authenticated users
  if (isAuthenticated) {
    return <ToastContainer />;
  }

  // Don't render anything for unauthenticated users
  return null;
}
