import { NextRequest, NextResponse } from "next/server";
import { getSongSuggestions } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const songs = await getSongSuggestions(id);
  return NextResponse.json({ songs });
}
