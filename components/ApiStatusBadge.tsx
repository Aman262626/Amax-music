"use client";

import { useState, useEffect } from "react";
import { IoServer, IoCheckmarkCircle, IoWarning, IoCloseCircle } from "react-icons/io5";

interface HealthStatus {
  status: string;
  latency: number;
  activeApi: string;
  healthyApis: number;
  totalApis: number;
  timestamp: string;
}

export default function ApiStatusBadge() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          setHealth(await res.json());
        }
      } catch {
        setHealth({
          status: "unhealthy",
          latency: 0,
          activeApi: "none",
          healthyApis: 0,
          totalApis: 0,
          timestamp: new Date().toISOString(),
        });
      }
    };

    check();
    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return null;

  const statusColor =
    health.status === "healthy"
      ? "text-green-400"
      : health.status === "degraded"
        ? "text-yellow-400"
        : "text-red-400";

  const StatusIcon =
    health.status === "healthy"
      ? IoCheckmarkCircle
      : health.status === "degraded"
        ? IoWarning
        : IoCloseCircle;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg glass hover:bg-white/10 transition-all text-xs"
        title="API Status"
      >
        <StatusIcon className={`text-sm ${statusColor}`} />
        <span className="text-white/60 hidden sm:inline">
          {health.healthyApis}/{health.totalApis} APIs
        </span>
      </button>

      {showDetails && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDetails(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 glass-card rounded-xl p-4 z-50 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <IoServer className="text-white/70" />
              <h3 className="text-sm font-bold text-white">API Status</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Status</span>
                <span className={`font-medium ${statusColor}`}>
                  {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Active API</span>
                <span className="text-white/80 font-mono">{health.activeApi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Latency</span>
                <span className="text-white/80">{health.latency}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Healthy Endpoints</span>
                <span className="text-white/80">
                  {health.healthyApis} / {health.totalApis}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: health.totalApis }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < health.healthyApis ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-white/40 mt-2">
                  Auto-failover active. If one API fails, the app switches to the next healthy
                  endpoint automatically.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
