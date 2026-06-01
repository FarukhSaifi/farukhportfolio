import { CustomMDX } from "@/components/mdx";
import { isHtmlBlogContent } from "@/lib/blog-content-format";
import type { BlogPost } from "@/lib/blog-posts";

import { SyncAppHtmlContent } from "./SyncAppHtmlContent";

type BlogPostContentProps = Pick<BlogPost, "content" | "source">;

export function BlogPostContent({ post }: { post: BlogPostContentProps }) {
  const isHtml = isHtmlBlogContent(post.content ?? "");

  if (post.source === "syncapp" && isHtml) {
    return <SyncAppHtmlContent html={post.content} />;
  }

  return <CustomMDX source={post.content} />;
}
