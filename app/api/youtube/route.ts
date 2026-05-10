import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      q + " official music video"
    )}&sp=EgIQAQ%3D%3D`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });
    const html = await res.text();

    const videoIds: string[] = [];
    const regex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
      if (!videoIds.includes(match[1])) {
        videoIds.push(match[1]);
      }
      if (videoIds.length >= 5) break;
    }

    return NextResponse.json({ videoIds });
  } catch {
    return NextResponse.json({ videoIds: [] });
  }
}
