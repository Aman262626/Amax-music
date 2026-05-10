import { NextRequest, NextResponse } from "next/server";

const SAAVN_API = "https://saavn.sumit.co/api";

export async function GET(request: NextRequest) {
  const songId = request.nextUrl.searchParams.get("id");
  const songName = request.nextUrl.searchParams.get("name");
  const artist = request.nextUrl.searchParams.get("artist");

  if (!songId && !songName) {
    return NextResponse.json({ error: "Missing id or name" }, { status: 400 });
  }

  const results: { source: string; lyrics: string; language?: string }[] = [];

  // Try JioSaavn lyrics first
  if (songId) {
    try {
      const res = await fetch(`${SAAVN_API}/songs/${songId}/lyrics`, {
        next: { revalidate: 86400 },
      });
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

  // Try lyrics.ovh as fallback
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
    return NextResponse.json({ lyrics: null, sources: [] });
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
