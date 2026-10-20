"use client";

import { useAnalytics } from "@/context/AnalyticsContext";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const SCROLL_MILESTONES = [25, 50, 75, 100] as const;
const SKIP_PATH_PREFIXES = ["/admin", "/api/", "/spotify-", "/youtube-music-"];
const BLOG_PATH_RE = /^\/blog\/([^/?#]+)/;

function shouldSkipPath(pathname: string): boolean {
  return SKIP_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function linkText(el: HTMLElement): string {
  const aria = el.getAttribute("aria-label")?.trim();
  if (aria) return aria;
  const text = (el.textContent || "").replace(/\s+/g, " ").trim();
  return text.slice(0, 120);
}

function hostnameFromHref(href: string): string {
  try {
    return new URL(href, window.location.origin).hostname;
  } catch {
    return "";
  }
}

/**
 * Site-wide page views, engagement timing, clicks, sections, and scroll depth.
 * Must render under AnalyticsProvider. Does not alter GTM bootstrap.
 */
export function AnalyticsTracker() {
  const analytics = useAnalytics();
  const pathname = usePathname() ?? "";
  const seenSections = useRef(new Set<string>());
  const seenScroll = useRef(new Set<number>());
  const routeStartedAt = useRef(Date.now());
  const visibleStartedAt = useRef(Date.now());
  const accumulatedMs = useRef(0);
  const isVisible = useRef(typeof document === "undefined" ? true : document.visibilityState === "visible");
  const lastPathRef = useRef(pathname);

  const flushEngagement = (path: string) => {
    if (shouldSkipPath(path)) return;

    let totalMs = accumulatedMs.current;
    if (isVisible.current) {
      totalMs += Date.now() - visibleStartedAt.current;
    }

    const seconds = Math.round(totalMs / 1000);
    analytics.trackPageEngagement({
      engagement_time_sec: seconds,
      page_path: path,
      page_title: typeof document !== "undefined" ? document.title : undefined,
    });

    accumulatedMs.current = 0;
    visibleStartedAt.current = Date.now();
    routeStartedAt.current = Date.now();
  };

  // Page view + engagement reset on App Router navigation
  useEffect(() => {
    if (shouldSkipPath(pathname)) {
      lastPathRef.current = pathname;
      return;
    }

    if (lastPathRef.current && lastPathRef.current !== pathname && !shouldSkipPath(lastPathRef.current)) {
      flushEngagement(lastPathRef.current);
    }

    lastPathRef.current = pathname;
    seenSections.current = new Set();
    seenScroll.current = new Set();
    accumulatedMs.current = 0;
    routeStartedAt.current = Date.now();
    visibleStartedAt.current = Date.now();
    isVisible.current = document.visibilityState === "visible";

    // Defer so document.title reflects the new route
    const id = window.setTimeout(() => {
      analytics.trackPageView({
        page_path: `${window.location.pathname}${window.location.search}`,
        page_location: window.location.href,
        page_title: document.title,
      });
    }, 0);

    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flush uses latest path via refs
  }, [pathname, analytics]);

  // Pause on hide; flush on pagehide / unload (route change flushes separately)
  useEffect(() => {
    if (shouldSkipPath(pathname)) return;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (isVisible.current) {
          accumulatedMs.current += Date.now() - visibleStartedAt.current;
          isVisible.current = false;
        }
      } else if (document.visibilityState === "visible") {
        isVisible.current = true;
        visibleStartedAt.current = Date.now();
      }
    };

    const onPageHide = () => {
      flushEngagement(lastPathRef.current || pathname);
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
    // flushEngagement closes over analytics + refs; pathname gates skip paths
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, analytics]);

  // Delegated click tracking
  useEffect(() => {
    if (shouldSkipPath(pathname)) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const tracked = target.closest<HTMLElement>("[data-analytics-tracked]");
      if (tracked) return;

      const pagePath = `${window.location.pathname}${window.location.search}`;

      // Explicit post cards
      const postEl = target.closest<HTMLElement>("[data-analytics-post]");
      if (postEl) {
        const slug = postEl.getAttribute("data-analytics-post-slug") || "";
        const title = postEl.getAttribute("data-analytics-post-title") || linkText(postEl);
        if (slug) {
          analytics.trackPostClick({
            post_slug: slug,
            post_title: title,
            link_url: postEl.getAttribute("href") || `${pagePath}`,
            element_text: title,
          });
          return;
        }
      }

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (anchor) {
        const href = anchor.getAttribute("href") || "";
        if (!href || href === "#") return;

        const element_text = linkText(anchor);
        const link_url = href;

        if (href.startsWith("mailto:")) {
          analytics.trackContactClick({ contact_method: "email", link_url, element_text });
          return;
        }

        if (href.startsWith("tel:")) {
          analytics.trackContactClick({ contact_method: "phone", link_url, element_text });
          return;
        }

        if (analytics.isPdfHref(href)) {
          const fileName = href.split("/").pop()?.split("?")[0];
          analytics.trackResumeDownload({
            link_url,
            element_text,
            file_name: fileName,
            file_extension: "pdf",
          });
          return;
        }

        const blogMatch = href.match(BLOG_PATH_RE);
        if (blogMatch) {
          analytics.trackPostClick({
            post_slug: blogMatch[1],
            post_title: element_text || blogMatch[1],
            link_url: href,
            element_text,
          });
          return;
        }

        const cta = anchor.closest<HTMLElement>("[data-analytics-cta]");
        if (cta) {
          analytics.trackCtaClick({
            cta_id: cta.getAttribute("data-analytics-cta") || anchor.id || undefined,
            cta_label: element_text || cta.getAttribute("data-analytics-cta") || "cta",
            button_location: pagePath,
            link_url,
            element_text,
          });
          return;
        }

        const inNav = Boolean(anchor.closest("header, [data-analytics-nav]"));
        if (inNav && href.startsWith("/")) {
          analytics.trackNavClick({
            nav_label: element_text || href,
            destination: href,
            link_url: href,
            element_text,
          });
          return;
        }

        const contactHost = hostnameFromHref(href);
        const isContactSocial =
          /linkedin\.com|github\.com|calendly\.com|twitter\.com|x\.com|threads\.net/i.test(contactHost) ||
          Boolean(anchor.closest("[data-analytics-contact]"));

        if (isContactSocial && analytics.isOutboundHref(href)) {
          analytics.trackContactClick({
            contact_method: contactHost || element_text || "social",
            link_url,
            element_text,
          });
          return;
        }

        if (analytics.isOutboundHref(href)) {
          analytics.trackOutboundClick({
            link_url,
            element_text,
            destination_host: contactHost,
          });
        }
        return;
      }

      // Non-anchor buttons / CTA controls
      const button = target.closest<HTMLElement>("button, [role='button'], [data-analytics-cta]");
      if (!button) return;

      const label = linkText(button);
      if (!label) return;

      const ctaId = button.getAttribute("data-analytics-cta");
      if (ctaId) {
        analytics.trackCtaClick({
          cta_id: ctaId,
          cta_label: label,
          button_location: pagePath,
          element_text: label,
        });
        return;
      }

      analytics.trackButtonClick({
        button_label: label,
        button_location: pagePath,
        element_text: label,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, analytics]);

  // Section visibility (once per section_id per route)
  useEffect(() => {
    if (shouldSkipPath(pathname) || typeof IntersectionObserver === "undefined") return;

    let cancelled = false;
    let observer: IntersectionObserver | undefined;

    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return;

      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-analytics-section]"));
      if (nodes.length === 0) return;

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            const sectionId = el.getAttribute("data-analytics-section");
            if (!sectionId || seenSections.current.has(sectionId)) continue;
            seenSections.current.add(sectionId);
            analytics.trackSectionView({
              section_id: sectionId,
              section_name: el.getAttribute("data-analytics-section-name") || sectionId,
            });
            observer?.unobserve(el);
          }
        },
        { threshold: 0.35, rootMargin: "0px 0px -10% 0px" },
      );

      nodes.forEach((node) => observer?.observe(node));
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [pathname, analytics]);

  // Scroll depth milestones (once each per route)
  useEffect(() => {
    if (shouldSkipPath(pathname)) return;

    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      const percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));

      for (const milestone of SCROLL_MILESTONES) {
        if (percent >= milestone && !seenScroll.current.has(milestone)) {
          seenScroll.current.add(milestone);
          analytics.trackScrollDepth({ percent_scrolled: milestone });
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, analytics]);

  return null;
}
