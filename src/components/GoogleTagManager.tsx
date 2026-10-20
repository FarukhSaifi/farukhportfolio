"use client";

import { ANALYTICS, APP_CONFIG } from "@/lib/constants";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
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
 * Loads Google Tag Manager (gtm.js) in production when NEXT_PUBLIC_GTM_ID is set.
 * Configure GA4 inside the GTM container — do not load gtag.js directly from the app.
 */
export function GoogleTagManager() {
  const gtmId = ANALYTICS.GTM_ID;

  if (!APP_CONFIG.IS_PRODUCTION || !gtmId) {
    return null;
  }

  return (
    <>
      {/* Official GTM bootstrap (equivalent to the head snippet for GTM-TZ7SLTFP) */}
      <Script id="gtm-base" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>
      <Suspense fallback={null}>
        <GtmPageViews />
      </Suspense>
    </>
  );
}
