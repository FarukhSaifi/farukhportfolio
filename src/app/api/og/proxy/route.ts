import { NextRequest, NextResponse } from "next/server";

const ALLOWED_DOMAINS = new Set([
  "farukh.me",
  "github.com",
  "avatars.githubusercontent.com",
  "images.unsplash.com",
  "cdn.hashnode.com",
  "raw.githubusercontent.com",
]);

function isAllowedUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "https:") {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_DOMAINS.has(hostname);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const imageUrl = url.searchParams.get("url");

    if (!imageUrl || !isAllowedUrl(imageUrl)) {
      return NextResponse.json(
        { error: "Invalid or disallowed URL parameter" },
        { status: 400 },
      );
    }

    const validatedUrl = new URL(imageUrl);

    // Fetch the image from allowed external URL only
    const response = await fetch(validatedUrl.href, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status },
      );
    }

    // Get the image data
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const imageData = await response.arrayBuffer();

    // Return the image with appropriate headers
    return new NextResponse(imageData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 });
  }
}
