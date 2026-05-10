import { NextRequest, NextResponse } from "next/server";
import { searchAll, searchSongs } from "@/lib/api";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const type = request.nextUrl.searchParams.get("type") || "all";
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10);

  if (!query.trim()) {
    return NextResponse.json({ songs: [], albums: [], artists: [], playlists: [] });
  }

  if (type === "songs") {
    const songs = await searchSongs(query, page, 30);
    return NextResponse.json({ songs });
  }

  const results = await searchAll(query);
  return NextResponse.json(results);
}
