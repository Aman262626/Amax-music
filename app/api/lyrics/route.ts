import { NextRequest, NextResponse } from "next/server";
import apiManager from "@/lib/apiManager";

// Multiple lyrics API sources for failover
const LYRICS_APIS = [
  { name: "lrclib", type: "lrclib" },
  { name: "saavn", type: "saavn" },
  { name: "lyrics.ovh", type: "ovh" },
];

export async function GET(request: NextRequest) {
  const songId = request.nextUrl.searchParams.get("id");
  const songName = request.nextUrl.searchParams.get("name");
  const artist = request.nextUrl.searchParams.get("artist");
  const duration = request.nextUrl.searchParams.get("duration");

  if (!songId && !songName) {
    return NextResponse.json({ error: "Missing id or name" }, { status: 400 });
  }

  const results: { source: string; lyrics: string; language?: string }[] = [];

  // Source 1: JioSaavn lyrics via API Manager (failover across 20+ endpoints)
  if (songId && results.length === 0) {
    try {
      const res = await apiManager.fetch(`/songs/${songId}/lyrics`);
      if (res.ok) {
        const data = await res.json();
        const lyrics = data.data?.lyrics as string | undefined;
        if (lyrics && lyrics.trim()) {
          results.push({
            source: "saavn",
            lyrics: lyrics.trim(),
            language: detectScript(lyrics),
          });
        }
      }
    } catch {
      // continue to next source
    }
  }

  // Source 2: LRCLIB (free lyrics database with synced + plain lyrics)
  if (results.length === 0 && songName && artist) {
    try {
      const params = new URLSearchParams({
        track_name: songName,
        artist_name: artist,
      });
      if (duration) params.set("duration", duration);

      const res = await fetch(`https://lrclib.net/api/get?${params}`, {
        headers: { "User-Agent": "AMAX Music Player v3.0" },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        const lyrics = (data.plainLyrics || data.syncedLyrics) as string | undefined;
        if (lyrics && lyrics.trim()) {
          results.push({
            source: "lrclib",
            lyrics: lyrics.trim(),
            language: detectScript(lyrics),
          });
        }
      }
    } catch {
      // continue
    }
  }

  // Source 3: LRCLIB search fallback (if exact match failed)
  if (results.length === 0 && songName) {
    try {
      const res = await fetch(
        `https://lrclib.net/api/search?q=${encodeURIComponent(songName + (artist ? " " + artist : ""))}`,
        {
          headers: { "User-Agent": "AMAX Music Player v3.0" },
          signal: AbortSignal.timeout(5000),
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const lyrics = (data[0].plainLyrics || data[0].syncedLyrics) as string | undefined;
          if (lyrics && lyrics.trim()) {
            results.push({
              source: "lrclib-search",
              lyrics: lyrics.trim(),
              language: detectScript(lyrics),
            });
          }
        }
      }
    } catch {
      // continue
    }
  }

  // Source 4: lyrics.ovh
  if (results.length === 0 && songName && artist) {
    try {
      const res = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songName)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.lyrics && data.lyrics.trim()) {
          results.push({
            source: "lyrics.ovh",
            lyrics: data.lyrics.trim(),
            language: detectScript(data.lyrics),
          });
        }
      }
    } catch {
      // continue
    }
  }

  if (results.length === 0) {
    return NextResponse.json({ lyrics: null, sources: LYRICS_APIS.map((a) => a.name) });
  }

  return NextResponse.json({
    lyrics: results[0].lyrics,
    language: results[0].language,
    sources: results,
  });
}

function detectScript(text: string): string {
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (text.match(/[a-zA-Z]/g) || []).length;
  const arabicCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const punjabiCount = (text.match(/[\u0A00-\u0A7F]/g) || []).length;
  const bengaliCount = (text.match(/[\u0980-\u09FF]/g) || []).length;
  const tamilCount = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  const teluguCount = (text.match(/[\u0C00-\u0C7F]/g) || []).length;

  const counts = [
    { lang: "Hindi", count: devanagariCount },
    { lang: "English", count: latinCount },
    { lang: "Urdu", count: arabicCount },
    { lang: "Punjabi", count: punjabiCount },
    { lang: "Bengali", count: bengaliCount },
    { lang: "Tamil", count: tamilCount },
    { lang: "Telugu", count: teluguCount },
  ];

  counts.sort((a, b) => b.count - a.count);
  return counts[0].count > 0 ? counts[0].lang : "Unknown";
}
