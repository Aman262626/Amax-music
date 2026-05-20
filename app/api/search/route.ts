import { NextRequest, NextResponse } from "next/server";
import { searchAll, searchSongs } from "@/lib/api";

interface LrcLibResult {
  trackName: string;
  artistName: string;
  albumName?: string;
  duration?: number;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const type = request.nextUrl.searchParams.get("type") || "all";
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10);

  if (!query.trim()) {
    return NextResponse.json({ songs: [], albums: [], artists: [], playlists: [] });
  }

  if (type === "songs") {
    let songs = await searchSongs(query, page, 30);
    // Retry once if empty results (API might have temporarily failed)
    if (songs.length === 0) {
      await new Promise((r) => setTimeout(r, 500));
      songs = await searchSongs(query, page, 30);
    }
    return NextResponse.json({ songs });
  }

  if (type === "lyrics") {
    const songs = await searchByLyrics(query);
    return NextResponse.json({ songs, searchedByLyrics: true });
  }

  const results = await searchAll(query);
  return NextResponse.json(results);
}

async function searchByLyrics(query: string) {
  try {
    const res = await fetch(
      `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`,
      {
        headers: { "User-Agent": "AMAX Music Player v3.0" },
        signal: AbortSignal.timeout(6000),
      }
    );
    if (!res.ok) return searchSongs(query, 1, 20);

    const data: LrcLibResult[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return searchSongs(query, 1, 20);
    }

    // Get unique song names from lyrics results, search them on JioSaavn
    const uniqueTracks = new Map<string, string>();
    for (const item of data.slice(0, 5)) {
      const key = `${item.trackName}-${item.artistName}`.toLowerCase();
      if (!uniqueTracks.has(key)) {
        uniqueTracks.set(key, `${item.trackName} ${item.artistName}`);
      }
    }

    const searchPromises = Array.from(uniqueTracks.values()).map((q) =>
      searchSongs(q, 1, 3)
    );
    const results = await Promise.all(searchPromises);
    const allSongs = results.flat();

    // Deduplicate by song ID
    const seen = new Set<string>();
    return allSongs.filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  } catch {
    return searchSongs(query, 1, 20);
  }
}
