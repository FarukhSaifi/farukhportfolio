import { getBlogPostsPaginated } from "@/lib/blog-posts";
import { BLOG_CONFIG } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const offset = Math.max(0, Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0);
  const limit = Math.min(
    BLOG_CONFIG.LIST_API_MAX_LIMIT,
    Math.max(
      1,
      Number.parseInt(searchParams.get("limit") ?? String(BLOG_CONFIG.LIST_API_DEFAULT_LIMIT), 10) ||
        BLOG_CONFIG.LIST_API_DEFAULT_LIMIT,
    ),
  );

  try {
    const page = await getBlogPostsPaginated(offset, limit);
    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error("Failed to load blog posts page:", error);
    return NextResponse.json({ success: false, error: "Failed to load blog posts" }, { status: 500 });
  }
}
