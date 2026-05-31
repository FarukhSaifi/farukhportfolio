import { getPosts, type PostMetadata } from "@/utils/utils";
import { cache } from "react";

import { syncAppFetch } from "./syncapp-client";

export type BlogPost = {
  metadata: PostMetadata;
  slug: string;
  content: string;
  source: "local" | "syncapp";
};

interface SyncAppPost {
  title: string;
  slug: string;
  status?: string;
  content_markdown?: string;
  tags?: string[];
  cover_image?: string;
  meta_description?: string;
  createdAt: string;
}

interface SyncAppListResponse {
  success: boolean;
  data: SyncAppPost[];
  pagination?: { totalPages: number };
}

const PUBLISHED_STATUS = "published";

function extractSummary(content: string): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*`_~[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= 160) return plain;
  return `${plain.slice(0, 157)}...`;
}

function mapSyncAppPost(post: SyncAppPost): BlogPost {
  const content = post.content_markdown || "";

  return {
    slug: post.slug,
    content,
    source: "syncapp",
    metadata: {
      title: post.title,
      publishedAt: new Date(post.createdAt).toISOString().split("T")[0],
      summary: post.meta_description?.trim() || extractSummary(content),
      image: post.cover_image || "",
      images: post.cover_image ? [post.cover_image] : [],
      tag: post.tags?.[0] || "",
      team: [],
    },
  };
}

function isPublishedPost(post: SyncAppPost): boolean {
  return !post.status || post.status === PUBLISHED_STATUS;
}

async function fetchSyncAppPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await syncAppFetch(`/posts/slug/${encodeURIComponent(slug)}`);

    if (!res.ok) return null;

    const json = (await res.json()) as { success?: boolean; data?: SyncAppPost };
    if (!json.success || !json.data || !isPublishedPost(json.data)) return null;

    return mapSyncAppPost(json.data);
  } catch (error) {
    console.warn(`Failed to fetch SyncApp post "${slug}":`, error);
    return null;
  }
}

async function fetchAllSyncAppPosts(): Promise<BlogPost[]> {
  const posts: SyncAppPost[] = [];
  let page = 1;
  let totalPages = 1;

  try {
    while (page <= totalPages) {
      const res = await syncAppFetch(`/posts?page=${page}&limit=50`);

      if (!res.ok) {
        console.warn(`SyncApp posts list failed: ${res.status}`);
        break;
      }

      const json = (await res.json()) as SyncAppListResponse;
      const pagePosts = (json.data || []).filter(isPublishedPost);
      posts.push(...pagePosts);
      totalPages = json.pagination?.totalPages || 1;
      page += 1;
    }
  } catch (error) {
    console.warn("Failed to fetch SyncApp posts:", error);
    return [];
  }

  return posts.map(mapSyncAppPost);
}

export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const [syncAppPosts, localPosts] = await Promise.all([
    fetchAllSyncAppPosts(),
    Promise.resolve(
      getPosts(["src", "app", "blog", "posts"]).map((post) => ({
        ...post,
        source: "local" as const,
      })),
    ),
  ]);

  const syncAppSlugs = new Set(syncAppPosts.map((post) => post.slug));
  const localOnly = localPosts.filter((post) => !syncAppSlugs.has(post.slug));

  return [...syncAppPosts, ...localOnly].sort(
    (a, b) => new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime(),
  );
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  const syncAppPost = await fetchSyncAppPostBySlug(slug);
  if (syncAppPost) return syncAppPost;

  const localPost = getPosts(["src", "app", "blog", "posts"]).find((post) => post.slug === slug);
  if (!localPost) return null;

  return { ...localPost, source: "local" };
});
