import { NextRequest, NextResponse } from "next/server";
import { getPlaylistById } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const playlist = await getPlaylistById(id);
  if (!playlist) {
    return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
  }
  return NextResponse.json(playlist);
}
