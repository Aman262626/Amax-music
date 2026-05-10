import { NextRequest, NextResponse } from "next/server";
import { getSongLyrics } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lyrics = await getSongLyrics(id);
  if (!lyrics) {
    return NextResponse.json({ error: "Lyrics not found" }, { status: 404 });
  }
  return NextResponse.json({ lyrics });
}
