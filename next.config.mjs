import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  poweredByHeader: false,
  optimizeFonts: true,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default withMDX(nextConfig);
