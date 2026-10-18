import { baseURL } from "@/resources";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/spotify-auth", "/spotify-success", "/youtube-music-success"],
      },
    ],
    sitemap: `${baseURL}/sitemap.xml`,
  };
}
