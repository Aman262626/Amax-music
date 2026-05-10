import { NextRequest, NextResponse } from "next/server";
import { getSongById } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const song = await getSongById(id);
  if (!song) {
    return NextResponse.json({ error: "Song not found" }, { status: 404 });
  }
  return NextResponse.json(song);
}
