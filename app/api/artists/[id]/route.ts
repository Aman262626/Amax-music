import { NextRequest, NextResponse } from "next/server";
import { getArtistById } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const artist = await getArtistById(id);
  if (!artist) {
    return NextResponse.json({ error: "Artist not found" }, { status: 404 });
  }
  return NextResponse.json(artist);
}
