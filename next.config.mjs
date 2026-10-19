import mdx from "@next/mdx";
import { NEXT_IMAGE_REMOTE_PATTERNS } from "./src/lib/constants/remote-image-hosts.mjs";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],

  /** Keep native driver out of the server bundle (faster builds, smaller output). */
  serverExternalPackages: ["mongodb"],

  experimental: {
    /** Tree-shake heavy barrel exports at build time. */
    // Do not add @once-ui-system/core here — it breaks prerender (undefined components).
    optimizePackageImports: ["react-icons"],
  },

  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".mdx", ".md", ".json"],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: NEXT_IMAGE_REMOTE_PATTERNS,
  },

  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  /**
   * Compatibility redirects for removed per-service music routes.
   * Stale clients / tabs still hit these after the unified `/api/music/*` migrate.
   */
  async rewrites() {
    return [
      {
        source: "/api/spotify/public-now-playing",
        destination: "/api/music/public-now-playing?service=spotify",
      },
      {
        source: "/api/youtube-music/public-now-playing",
        destination: "/api/music/public-now-playing?service=youtube_music",
      },
      {
        source: "/api/apple-music/public-now-playing",
        destination: "/api/music/public-now-playing?service=apple_music",
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/admin",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default withMDX(nextConfig);
