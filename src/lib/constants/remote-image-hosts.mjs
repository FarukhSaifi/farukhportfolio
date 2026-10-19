/**
 * Shared Next.js `images.remotePatterns` entries.
 * Imported by next.config.mjs (ESM) — keep this file .mjs without TypeScript.
 *
 * Pathname must be `/**` (not `**`). A restart/`next build` is required after edits.
 */
export const NEXT_IMAGE_REMOTE_PATTERNS = [
  {
    protocol: "https",
    hostname: "i.scdn.co",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "i.ytimg.com",
    port: "",
    pathname: "/**",
  },
  /** Some YouTube CDN responses use i1–i4.ytimg.com */
  {
    protocol: "https",
    hostname: "*.ytimg.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "yt3.ggpht.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "*.ggpht.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "is1-ssl.mzstatic.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "is2-ssl.mzstatic.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "is3-ssl.mzstatic.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "is4-ssl.mzstatic.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "is5-ssl.mzstatic.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "*.mzstatic.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "firebasestorage.googleapis.com",
    port: "",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "storage.googleapis.com",
    port: "",
    pathname: "/**",
  },
];
