import { CustomMDX } from "@/components/mdx";
import type { BlogPost } from "@/lib/blog-posts";

import { SyncAppHtmlContent } from "./SyncAppHtmlContent";

type BlogPostContentProps = Pick<BlogPost, "content" | "source">;

export function BlogPostContent({ post }: { post: BlogPostContentProps }) {
  if (post.source === "syncapp") {
    return <SyncAppHtmlContent html={post.content} />;
  }

  return <CustomMDX source={post.content} />;
}
