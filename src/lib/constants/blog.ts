/** Local MDX directories relative to project root (passed to getPosts). */
export const MDX_CONTENT_PATHS = {
  BLOG: ["src", "app", "blog", "posts"],
  WORK: ["src", "app", "work", "projects"],
} as const;

export const BLOG_CONFIG = {
  INITIAL_PAGE_SIZE: 10,
  LAZY_PAGE_SIZE: 10,
  LIST_API_DEFAULT_LIMIT: 6,
  LIST_API_MAX_LIMIT: 50,
  PUBLISHED_STATUS: "published",
  SUMMARY_MAX_LENGTH: 160,
  SYNCAPP_PAGE_LIMIT: 50,
  INTERSECTION_ROOT_MARGIN: "200px",
} as const;

/** Fenced code language that should render as a diagram (Dev.to / SyncApp / MDX). */
export const MERMAID_LANGUAGE = "mermaid";

export const MERMAID_CONFIG = {
  SECURITY_LEVEL: "strict",
  THEME_DARK: "dark",
  THEME_LIGHT: "default",
} as const;

export const MERMAID_MESSAGES = {
  RENDER_FAILED: "Unable to render Mermaid diagram.",
  LOADING: "Loading diagram…",
} as const;
