import { NextRequest, NextResponse } from "next/server";

// Multiple YouTube search fallback methods
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
];

async function searchYouTubeDirect(query: string): Promise<string[]> {
  const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    query + " official music video"
  )}&sp=EgIQAQ%3D%3D`;

  const res = await fetch(searchUrl, {
    headers: { "User-Agent": ua },
    signal: AbortSignal.timeout(8000),
  });
  const html = await res.text();
  const videoIds: string[] = [];
  const regex = /\/watch\?v=([a-zA-Z0-9_-]{11})/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    if (!videoIds.includes(match[1])) videoIds.push(match[1]);
    if (videoIds.length >= 5) break;
  }
  return videoIds;
}

async function searchInvidious(query: string): Promise<string[]> {
  const instances = [
    "https://inv.nadeko.net",
    "https://invidious.nerdvpn.de",
    "https://invidious.privacyredirect.com",
    "https://vid.puffyan.us",
  ];

  for (const instance of instances) {
    try {
      const res = await fetch(
        `${instance}/api/v1/search?q=${encodeURIComponent(query + " official music video")}&type=video`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          return data
            .filter((v: Record<string, unknown>) => v.type === "video")
            .slice(0, 5)
            .map((v: Record<string, unknown>) => v.videoId as string);
        }
      }
    } catch {
      continue;
    }
  }
  return [];
}

async function searchPiped(query: string): Promise<string[]> {
  const instances = [
    "https://pipedapi.kavin.rocks",
    "https://api.piped.yt",
    "https://pipedapi.in.projectsegfau.lt",
  ];

  for (const instance of instances) {
    try {
      const res = await fetch(
        `${instance}/search?q=${encodeURIComponent(query + " official music video")}&filter=videos`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        const items = data.items as { url: string }[] | undefined;
        if (items && items.length > 0) {
          return items
            .slice(0, 5)
            .map((item) => {
              const match = item.url.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
              return match ? match[1] : null;
            })
            .filter(Boolean) as string[];
        }
      }
    } catch {
      continue;
    }
  }
  return [];
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  // Method 1: Direct YouTube search
  try {
    const videoIds = await searchYouTubeDirect(q);
    if (videoIds.length > 0) {
      return NextResponse.json({ videoIds, source: "youtube" });
    }
  } catch {
    // fallback
  }

  // Method 2: Invidious API
  try {
    const videoIds = await searchInvidious(q);
    if (videoIds.length > 0) {
      return NextResponse.json({ videoIds, source: "invidious" });
    }
  } catch {
    // fallback
  }

  // Method 3: Piped API
  try {
    const videoIds = await searchPiped(q);
    if (videoIds.length > 0) {
      return NextResponse.json({ videoIds, source: "piped" });
    }
  } catch {
    // fallback
  }

  return NextResponse.json({ videoIds: [], source: null });
}
