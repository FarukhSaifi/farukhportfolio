import { baseURL } from "@/resources";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/spotify-auth", "/spotify-success"],
      },
    ],
    sitemap: `${baseURL}/sitemap.xml`,
  };
}
