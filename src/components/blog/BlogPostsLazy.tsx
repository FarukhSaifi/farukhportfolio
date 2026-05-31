"use client";

import { BlogPostListItem } from "@/lib/blog-posts";
import { Button, Column, Grid, Spinner } from "@once-ui-system/core";
import { useCallback, useEffect, useRef, useState } from "react";

import Post from "./Post";

interface BlogPostsLazyProps {
  initialPosts: BlogPostListItem[];
  total: number;
  startOffset: number;
  pageSize?: number;
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
  direction?: "row" | "column";
}

export function BlogPostsLazy({
  initialPosts,
  total,
  startOffset,
  pageSize = 10,
  columns = "2",
  thumbnail = false,
  direction,
}: BlogPostsLazyProps) {
  const [posts, setPosts] = useState<BlogPostListItem[]>(initialPosts);
  const [offset, setOffset] = useState(startOffset);
  const [hasMore, setHasMore] = useState(startOffset < total);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/blog/posts?offset=${offset}&limit=${pageSize}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = (await res.json()) as {
        success?: boolean;
        data?: { posts: BlogPostListItem[]; hasMore: boolean; offset: number };
      };

      if (!json.success || !json.data) throw new Error("Invalid response");

      setPosts((prev) => {
        const existing = new Set(prev.map((p) => p.slug));
        const next = json.data!.posts.filter((p) => !existing.has(p.slug));
        return [...prev, ...next];
      });
      setOffset(json.data.offset + json.data.posts.length);
      setHasMore(json.data.hasMore);
    } catch (err) {
      console.error("Failed to load more blog posts:", err);
      setError("Could not load more posts.");
    } finally {
      setLoading(false);
    }
  }, [hasMore, loading, offset, pageSize]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (posts.length === 0 && !hasMore) return null;

  return (
    <Column fillWidth gap="16">
      <Grid columns={columns} s={{ columns: 1 }} fillWidth gap="16">
        {posts.map((post) => (
          <Post key={post.slug} post={post} thumbnail={thumbnail} direction={direction} />
        ))}
      </Grid>

      <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />

      {loading && (
        <Column horizontal="center" paddingY="24">
          <Spinner size="m" />
        </Column>
      )}

      {error && (
        <Column horizontal="center" paddingY="8">
          <Button variant="secondary" size="s" onClick={loadMore}>
            {error} Try again
          </Button>
        </Column>
      )}
    </Column>
  );
}
