import { NextResponse } from "next/server";
import apiManager from "@/lib/apiManager";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = apiManager.getStatus();
  return NextResponse.json(status);
}
