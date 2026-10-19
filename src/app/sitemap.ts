import { getBlogPosts } from "@/lib/blog-posts";
import { MDX_CONTENT_PATHS, ROUTES } from "@/lib/constants";
import { getPosts } from "@/lib/mdx";
import { baseURL, routes as routesConfig } from "@/resources";

/** Private / OAuth callback routes — never list in sitemap. */
const SITEMAP_EXCLUDED_ROUTES = new Set<string>([
  ROUTES.ADMIN,
  ROUTES.SPOTIFY_AUTH,
  ROUTES.SPOTIFY_SUCCESS,
  ROUTES.YOUTUBE_MUSIC_SUCCESS,
]);

/** Regenerate sitemap on the same schedule as SyncApp blog fetches (5 min). */
export const revalidate = 300;

export default async function sitemap() {
  const blogs = (await getBlogPosts()).map((post) => ({
    url: `${baseURL}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const works = getPosts(MDX_CONTENT_PATHS.WORK).map((post) => ({
    url: `${baseURL}/work/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const activeRoutes = Object.keys(routesConfig).filter(
    (route) => routesConfig[route as keyof typeof routesConfig] && !SITEMAP_EXCLUDED_ROUTES.has(route),
  );

  const routes = activeRoutes.map((route) => ({
    url: `${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs, ...works];
}
