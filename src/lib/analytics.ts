/**
 * Type-safe GA4 event tracking for the portfolio.
 * Uses window.gtag when available (e.g. after GTM loads a GA4 Configuration tag).
 * SSR-safe: no-ops when window/gtag is missing — never throws.
 *
 * Prefer consuming via useAnalytics() from AnalyticsProvider.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Custom portfolio events (snake_case per GA4 custom-event conventions). */
export const GA_CUSTOM_EVENTS = {
  PROJECT_VIEW: "project_view",
  CONTACT_CLICK: "contact_click",
  RESUME_DOWNLOAD: "resume_download",
  SECTION_VIEW: "section_view",
  NAV_CLICK: "nav_click",
  CTA_CLICK: "cta_click",
  BUTTON_CLICK: "button_click",
  OUTBOUND_CLICK: "outbound_click",
  SCROLL_DEPTH: "scroll_depth",
  NEWSLETTER_SUBSCRIBE: "newsletter_subscribe",
  PAGE_ENGAGEMENT: "page_engagement",
  POST_CLICK: "post_click",
} as const;

/**
 * GA4 recommended event names.
 * @see https://developers.google.com/analytics/devguides/collection/ga4/reference/events
 */
export const GA_RECOMMENDED_EVENTS = {
  PAGE_VIEW: "page_view",
  SCROLL: "scroll",
  SELECT_CONTENT: "select_content",
  SHARE: "share",
  GENERATE_LEAD: "generate_lead",
  CLICK: "click",
  FILE_DOWNLOAD: "file_download",
  VIEW_ITEM: "view_item",
} as const;

export const GA_EVENT_CATEGORIES = {
  ENGAGEMENT: "engagement",
  NAVIGATION: "navigation",
  CONTACT: "contact",
  CONVERSION: "conversion",
  CONTENT: "content",
} as const;

export type GaCustomEventName = (typeof GA_CUSTOM_EVENTS)[keyof typeof GA_CUSTOM_EVENTS];
export type GaRecommendedEventName = (typeof GA_RECOMMENDED_EVENTS)[keyof typeof GA_RECOMMENDED_EVENTS];
export type GaEventName = GaCustomEventName | GaRecommendedEventName;
export type GaEventCategory = (typeof GA_EVENT_CATEGORIES)[keyof typeof GA_EVENT_CATEGORIES];

export type GaEventParams = Record<string, string | number | boolean | null | undefined>;

export type GaContextParams = {
  event_category?: GaEventCategory | string;
  event_action?: string;
  event_label?: string;
  value?: number;
  page_location?: string;
  page_path?: string;
  page_title?: string;
  link_url?: string;
  element_text?: string;
  content_type?: string;
  item_name?: string;
  item_id?: string;
  engagement_time_sec?: number;
};

export type ProjectViewParams = GaContextParams & {
  project_title: string;
  project_slug?: string;
  engagement_type?: "about" | "external";
};

export type ContactClickParams = GaContextParams & {
  contact_method: string;
};

export type ResumeDownloadParams = GaContextParams & {
  file_name?: string;
  file_extension?: string;
};

export type SectionViewParams = GaContextParams & {
  section_id: string;
  section_name?: string;
};

export type NavClickParams = GaContextParams & {
  nav_label: string;
  destination?: string;
};

export type CtaClickParams = GaContextParams & {
  cta_id?: string;
  cta_label: string;
  button_location?: string;
};

export type ButtonClickParams = GaContextParams & {
  button_label: string;
  button_location?: string;
};

export type OutboundClickParams = GaContextParams & {
  destination_host?: string;
};

export type ScrollDepthParams = GaContextParams & {
  percent_scrolled: 25 | 50 | 75 | 100;
};

export type ShareParams = GaContextParams & {
  method: string;
};

export type PostClickParams = GaContextParams & {
  post_title: string;
  post_slug: string;
};

export type PageViewParams = GaContextParams & {
  page_title?: string;
  page_path?: string;
  page_location?: string;
};

export type PageEngagementParams = GaContextParams & {
  engagement_time_sec: number;
  page_path?: string;
  page_title?: string;
};

function isGtagAvailable(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

/** Current page context for every event (safe on client only). */
export function getPageContext(): Pick<GaContextParams, "page_location" | "page_path" | "page_title"> {
  if (typeof window === "undefined") return {};
  return {
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}`,
    page_title: typeof document !== "undefined" ? document.title : undefined,
  };
}

function cleanParams(params?: GaEventParams): GaEventParams | undefined {
  if (!params) return undefined;
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

/**
 * Send a GA4 event via gtag('event', name, params).
 * No-ops on the server or when gtag has not loaded yet.
 */
export function trackEvent(eventName: GaEventName | (string & {}), params?: GaEventParams): void {
  if (!isGtagAvailable()) return;

  try {
    const payload = cleanParams({
      ...getPageContext(),
      ...params,
    });
    window.gtag!("event", eventName, payload);
  } catch {
    // Never break UI for analytics failures
  }
}

/** App Router route page views. */
export function trackPageView(params: PageViewParams = {}): void {
  const ctx = getPageContext();
  trackEvent(GA_RECOMMENDED_EVENTS.PAGE_VIEW, {
    event_category: GA_EVENT_CATEGORIES.NAVIGATION,
    event_action: GA_RECOMMENDED_EVENTS.PAGE_VIEW,
    event_label: params.page_path ?? ctx.page_path,
    page_title: params.page_title ?? ctx.page_title,
    page_location: params.page_location ?? ctx.page_location,
    page_path: params.page_path ?? ctx.page_path,
    ...params,
  });
}

/** Time spent on a page (flush on hide / route change). */
export function trackPageEngagement(params: PageEngagementParams): void {
  if (params.engagement_time_sec < 1) return;

  trackEvent(GA_CUSTOM_EVENTS.PAGE_ENGAGEMENT, {
    event_category: GA_EVENT_CATEGORIES.ENGAGEMENT,
    event_action: GA_CUSTOM_EVENTS.PAGE_ENGAGEMENT,
    event_label: params.page_path ?? getPageContext().page_path,
    value: params.engagement_time_sec,
    ...params,
  });
}

/** Blog / article card clicks. */
export function trackPostClick(params: PostClickParams): void {
  trackEvent(GA_CUSTOM_EVENTS.POST_CLICK, {
    event_category: GA_EVENT_CATEGORIES.CONTENT,
    event_action: GA_CUSTOM_EVENTS.POST_CLICK,
    event_label: params.post_title,
    content_type: "blog_post",
    item_name: params.post_title,
    item_id: params.post_slug,
    ...params,
  });
  trackEvent(GA_RECOMMENDED_EVENTS.SELECT_CONTENT, {
    event_category: GA_EVENT_CATEGORIES.CONTENT,
    event_action: GA_RECOMMENDED_EVENTS.SELECT_CONTENT,
    event_label: params.post_title,
    content_type: "blog_post",
    item_id: params.post_slug,
    item_name: params.post_title,
  });
}

/** Generic button / control clicks. */
export function trackButtonClick(params: ButtonClickParams): void {
  trackEvent(GA_CUSTOM_EVENTS.BUTTON_CLICK, {
    event_category: GA_EVENT_CATEGORIES.ENGAGEMENT,
    event_action: GA_CUSTOM_EVENTS.BUTTON_CLICK,
    event_label: params.button_label,
    element_text: params.button_label,
    ...params,
  });
  trackEvent(GA_RECOMMENDED_EVENTS.CLICK, {
    event_category: GA_EVENT_CATEGORIES.ENGAGEMENT,
    event_action: GA_RECOMMENDED_EVENTS.CLICK,
    event_label: params.button_label,
    link_text: params.button_label,
    ...params,
  });
}

/** Project card / case-study interactions. */
export function trackProjectView(params: ProjectViewParams): void {
  trackEvent(GA_CUSTOM_EVENTS.PROJECT_VIEW, {
    event_category: GA_EVENT_CATEGORIES.CONTENT,
    event_action: GA_CUSTOM_EVENTS.PROJECT_VIEW,
    event_label: params.project_title,
    content_type: "project",
    item_name: params.project_title,
    item_id: params.project_slug,
    ...params,
  });
  trackEvent(GA_RECOMMENDED_EVENTS.VIEW_ITEM, {
    event_category: GA_EVENT_CATEGORIES.CONTENT,
    event_action: GA_RECOMMENDED_EVENTS.VIEW_ITEM,
    event_label: params.project_title,
    content_type: "project",
    item_name: params.project_title,
    item_id: params.project_slug,
  });
}

/** Social, mailto, calendar, and other contact CTAs. */
export function trackContactClick(params: ContactClickParams): void {
  trackEvent(GA_CUSTOM_EVENTS.CONTACT_CLICK, {
    event_category: GA_EVENT_CATEGORIES.CONTACT,
    event_action: GA_CUSTOM_EVENTS.CONTACT_CLICK,
    event_label: params.contact_method,
    ...params,
  });
}

/** Resume / CV / PDF downloads. */
export function trackResumeDownload(params: ResumeDownloadParams = {}): void {
  trackEvent(GA_CUSTOM_EVENTS.RESUME_DOWNLOAD, {
    event_category: GA_EVENT_CATEGORIES.CONVERSION,
    event_action: GA_CUSTOM_EVENTS.RESUME_DOWNLOAD,
    event_label: params.file_name ?? params.link_url ?? "resume",
    ...params,
  });
  trackEvent(GA_RECOMMENDED_EVENTS.FILE_DOWNLOAD, {
    event_category: GA_EVENT_CATEGORIES.CONVERSION,
    event_action: GA_RECOMMENDED_EVENTS.FILE_DOWNLOAD,
    event_label: params.file_name ?? params.link_url,
    file_name: params.file_name,
    file_extension: params.file_extension ?? "pdf",
    link_url: params.link_url,
  });
}

/** Section entered viewport (fires once per section id per page load). */
export function trackSectionView(params: SectionViewParams): void {
  trackEvent(GA_CUSTOM_EVENTS.SECTION_VIEW, {
    event_category: GA_EVENT_CATEGORIES.ENGAGEMENT,
    event_action: GA_CUSTOM_EVENTS.SECTION_VIEW,
    event_label: params.section_name ?? params.section_id,
    content_type: "section",
    item_id: params.section_id,
    item_name: params.section_name ?? params.section_id,
    ...params,
  });
}

/** Primary header / in-app navigation. */
export function trackNavClick(params: NavClickParams): void {
  trackEvent(GA_CUSTOM_EVENTS.NAV_CLICK, {
    event_category: GA_EVENT_CATEGORIES.NAVIGATION,
    event_action: GA_CUSTOM_EVENTS.NAV_CLICK,
    event_label: params.nav_label,
    ...params,
  });
}

/** Hero / marketing CTA buttons. */
export function trackCtaClick(params: CtaClickParams): void {
  trackEvent(GA_CUSTOM_EVENTS.CTA_CLICK, {
    event_category: GA_EVENT_CATEGORIES.ENGAGEMENT,
    event_action: GA_CUSTOM_EVENTS.CTA_CLICK,
    event_label: params.cta_label,
    button_location: params.button_location ?? getPageContext().page_path,
    ...params,
  });
}

/** Clicks to external hosts. */
export function trackOutboundClick(params: OutboundClickParams): void {
  trackEvent(GA_CUSTOM_EVENTS.OUTBOUND_CLICK, {
    event_category: GA_EVENT_CATEGORIES.NAVIGATION,
    event_action: GA_CUSTOM_EVENTS.OUTBOUND_CLICK,
    event_label: params.destination_host ?? params.link_url,
    ...params,
  });
}

/** Scroll depth milestones (25 / 50 / 75 / 100), once each per page. */
export function trackScrollDepth(params: ScrollDepthParams): void {
  trackEvent(GA_CUSTOM_EVENTS.SCROLL_DEPTH, {
    event_category: GA_EVENT_CATEGORIES.ENGAGEMENT,
    event_action: GA_CUSTOM_EVENTS.SCROLL_DEPTH,
    event_label: `${params.percent_scrolled}%`,
    value: params.percent_scrolled,
    ...params,
  });
  trackEvent(GA_RECOMMENDED_EVENTS.SCROLL, {
    event_category: GA_EVENT_CATEGORIES.ENGAGEMENT,
    event_action: GA_RECOMMENDED_EVENTS.SCROLL,
    event_label: `${params.percent_scrolled}%`,
    value: params.percent_scrolled,
    ...params,
  });
}

/** Blog / content share actions. */
export function trackShare(params: ShareParams): void {
  trackEvent(GA_RECOMMENDED_EVENTS.SHARE, {
    event_category: GA_EVENT_CATEGORIES.ENGAGEMENT,
    event_action: GA_RECOMMENDED_EVENTS.SHARE,
    event_label: params.method,
    ...params,
  });
}

/** Newsletter signup success. */
export function trackNewsletterSubscribe(params: GaContextParams = {}): void {
  trackEvent(GA_CUSTOM_EVENTS.NEWSLETTER_SUBSCRIBE, {
    event_category: GA_EVENT_CATEGORIES.CONVERSION,
    event_action: GA_CUSTOM_EVENTS.NEWSLETTER_SUBSCRIBE,
    event_label: "newsletter",
    ...params,
  });
  trackEvent(GA_RECOMMENDED_EVENTS.GENERATE_LEAD, {
    event_category: GA_EVENT_CATEGORIES.CONVERSION,
    event_action: GA_RECOMMENDED_EVENTS.GENERATE_LEAD,
    event_label: "newsletter",
    ...params,
  });
}

/** True when href points off-site (or protocol handler like mailto/tel). */
export function isOutboundHref(
  href: string,
  currentHost = typeof window !== "undefined" ? window.location.host : "",
): boolean {
  if (!href || href.startsWith("#") || href.startsWith("/")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return true;
  try {
    const url = new URL(href, typeof window !== "undefined" ? window.location.origin : "https://farukh.me");
    return Boolean(currentHost) && url.host !== currentHost;
  } catch {
    return false;
  }
}

export function isPdfHref(href: string): boolean {
  try {
    const path = href.startsWith("http") ? new URL(href).pathname : href.split("?")[0];
    return /\.pdf$/i.test(path);
  } catch {
    return /\.pdf(\?|#|$)/i.test(href);
  }
}

/** Stable API surface for React context. */
export const analyticsApi = {
  trackEvent,
  trackPageView,
  trackPageEngagement,
  trackPostClick,
  trackButtonClick,
  trackProjectView,
  trackContactClick,
  trackResumeDownload,
  trackSectionView,
  trackNavClick,
  trackCtaClick,
  trackOutboundClick,
  trackScrollDepth,
  trackShare,
  trackNewsletterSubscribe,
  isOutboundHref,
  isPdfHref,
  getPageContext,
  events: { ...GA_CUSTOM_EVENTS, ...GA_RECOMMENDED_EVENTS },
  categories: GA_EVENT_CATEGORIES,
  customEvents: GA_CUSTOM_EVENTS,
  recommendedEvents: GA_RECOMMENDED_EVENTS,
} as const;

export type AnalyticsApi = typeof analyticsApi;
