"use client";

import { analyticsApi, type AnalyticsApi } from "@/lib/analytics";
import { createContext, useContext, type ReactNode } from "react";

const AnalyticsContext = createContext<AnalyticsApi | null>(null);

/**
 * Provides typed GA4 helpers + event constants app-wide.
 * Prefer useAnalytics() in components instead of importing @/lib/analytics directly.
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  return <AnalyticsContext.Provider value={analyticsApi}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics(): AnalyticsApi {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return ctx;
}
