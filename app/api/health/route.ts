import { NextResponse } from "next/server";
import apiManager from "@/lib/apiManager";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  // Make a lightweight test request through the manager
  try {
    const res = await apiManager.fetch("/search/songs?query=test&limit=1");
    const ok = res.ok;
    const latency = Date.now() - start;
    const status = apiManager.getStatus();

    return NextResponse.json({
      status: ok ? "healthy" : "degraded",
      latency,
      activeApi: status.active,
      healthyApis: status.healthy,
      totalApis: status.total,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      {
        status: "unhealthy",
        latency: Date.now() - start,
        activeApi: null,
        healthyApis: 0,
        totalApis: apiManager.getEndpointCount(),
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
