import { getBlogPostsPaginated } from "@/lib/blog-posts";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const offset = Math.max(0, Number.parseInt(searchParams.get("offset") ?? "0", 10) || 0);
  const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") ?? "6", 10) || 6));

  try {
    const page = await getBlogPostsPaginated(offset, limit);
    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error("Failed to load blog posts page:", error);
    return NextResponse.json({ success: false, error: "Failed to load blog posts" }, { status: 500 });
  }
}
