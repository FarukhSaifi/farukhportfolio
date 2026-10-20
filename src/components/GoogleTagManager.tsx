"use client";

import { ANALYTICS, APP_CONFIG } from "@/lib/constants";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Pushes page_view into dataLayer on App Router navigations (home, blog posts, etc.).
 * In GTM: trigger a GA4 Event tag on Custom Event = page_view
 * (and set GA4 Configuration "send page view" to false to avoid double counts).
 *
 * The gtm.js bootstrap lives in src/app/layout.tsx <head> (SSR) so GTM detection works.
 */
function GtmPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.dataLayer) return;

    const query = searchParams?.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    window.dataLayer.push({
      event: "page_view",
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}

/**
 * Client-only SPA page_view bridge. GTM container bootstrap is server-rendered in layout head.
 */
export function GoogleTagManager() {
  if (!APP_CONFIG.IS_PRODUCTION || !ANALYTICS.GTM_ID) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <GtmPageViews />
    </Suspense>
  );
}
