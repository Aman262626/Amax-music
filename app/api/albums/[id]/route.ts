import { NextRequest, NextResponse } from "next/server";
import { getAlbumById } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const album = await getAlbumById(id);
  if (!album) {
    return NextResponse.json({ error: "Album not found" }, { status: 404 });
  }
  return NextResponse.json(album);
}
