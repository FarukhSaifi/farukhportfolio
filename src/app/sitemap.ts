import { getBlogPosts } from "@/lib/blog-posts";
import { MDX_CONTENT_PATHS } from "@/lib/constants";
import { getPosts } from "@/lib/mdx";
import { baseURL, routes as routesConfig } from "@/resources";

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

  const activeRoutes = Object.keys(routesConfig).filter((route) => routesConfig[route as keyof typeof routesConfig]);

  const routes = activeRoutes.map((route) => ({
    url: `${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  return [...routes, ...blogs, ...works];
}
