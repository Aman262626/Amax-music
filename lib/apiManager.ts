/**
 * API Manager with 20+ endpoints and automatic failover.
 *
 * If one API is down, it automatically switches to the next healthy one.
 * Tracks response times and error counts to prioritize faster, more
 * reliable endpoints.
 */

export interface ApiEndpoint {
  url: string;
  name: string;
  priority: number; // lower = higher priority
}

interface EndpointHealth {
  failures: number;
  lastFailure: number;
  avgResponseTime: number;
  totalRequests: number;
  isHealthy: boolean;
  lastSuccess: number;
}

// All known JioSaavn API instances (20+ endpoints)
const API_ENDPOINTS: ApiEndpoint[] = [
  // Primary - Cloudflare Workers (fast, reliable)
  { url: "https://jiosaavn-apix.arcadopredator.workers.dev/api", name: "arcado-cf", priority: 1 },

  // Tier 1 - Verified working Vercel deployments
  { url: "https://jiosaavn-api-lilac.vercel.app/api", name: "lilac", priority: 2 },
  { url: "https://jiosaavn-api-amber.vercel.app/api", name: "amber", priority: 2 },
  { url: "https://jiosaavn-api-lime.vercel.app/api", name: "lime", priority: 2 },
  { url: "https://jiosaavn-api-sage.vercel.app/api", name: "sage", priority: 2 },
  { url: "https://jiosaavn-api-xi.vercel.app/api", name: "xi", priority: 2 },
  { url: "https://jiosaavn-api-nine.vercel.app/api", name: "nine", priority: 2 },
  { url: "https://jiosaavn-api-v4.vercel.app/api", name: "v4", priority: 2 },
  { url: "https://jiosaavn-api-black.vercel.app/api", name: "black", priority: 2 },
  { url: "https://jiosaavn-api-lovat.vercel.app/api", name: "lovat", priority: 2 },
  { url: "https://my-jiosaavn-api.vercel.app/api", name: "my-saavn", priority: 2 },

  // Tier 2 - Known endpoints (may have rate limits)
  { url: "https://saavn.sumit.co/api", name: "sumit", priority: 3 },

  // Tier 3 - Additional instances to try
  { url: "https://jiosaavn-api-coral.vercel.app/api", name: "coral", priority: 4 },
  { url: "https://jiosaavn-api-sand.vercel.app/api", name: "sand", priority: 4 },
  { url: "https://jiosaavn-api-vert.vercel.app/api", name: "vert", priority: 4 },
  { url: "https://jio-saavn-api.vercel.app/api", name: "jio-saavn", priority: 4 },
  { url: "https://jiosaavn-api-nu.vercel.app/api", name: "nu", priority: 4 },
  { url: "https://jiosaavn-api-tan.vercel.app/api", name: "tan", priority: 4 },
  { url: "https://jiosaavn-api-eight.vercel.app/api", name: "eight", priority: 4 },
  { url: "https://jiosaavn-api-alpha.vercel.app/api", name: "alpha", priority: 4 },
  { url: "https://jiosaavn-whollyapi.vercel.app/api", name: "wholly", priority: 4 },
  { url: "https://jiosaavn-api-green.vercel.app/api", name: "green", priority: 4 },
  { url: "https://jio-saavn-api-psi.vercel.app/api", name: "psi", priority: 4 },
];

const FAILURE_THRESHOLD = 3;
const RECOVERY_TIMEOUT_MS = 60_000; // 1 minute before retrying failed endpoint
const REQUEST_TIMEOUT_MS = 8_000;

class ApiManager {
  private healthMap: Map<string, EndpointHealth> = new Map();
  private activeIndex = 0;
  private roundRobinOffset = 0;

  constructor() {
    for (const ep of API_ENDPOINTS) {
      this.healthMap.set(ep.url, {
        failures: 0,
        lastFailure: 0,
        avgResponseTime: 0,
        totalRequests: 0,
        isHealthy: true,
        lastSuccess: 0,
      });
    }
  }

  private getHealthyEndpoints(): ApiEndpoint[] {
    const now = Date.now();
    return API_ENDPOINTS.filter((ep) => {
      const health = this.healthMap.get(ep.url)!;
      if (health.isHealthy) return true;
      // Allow recovery after timeout
      if (now - health.lastFailure > RECOVERY_TIMEOUT_MS) {
        health.isHealthy = true;
        health.failures = 0;
        return true;
      }
      return false;
    }).sort((a, b) => {
      const ha = this.healthMap.get(a.url)!;
      const hb = this.healthMap.get(b.url)!;
      // Sort by priority first, then by avg response time
      if (a.priority !== b.priority) return a.priority - b.priority;
      return ha.avgResponseTime - hb.avgResponseTime;
    });
  }

  private recordSuccess(url: string, responseTime: number): void {
    const health = this.healthMap.get(url);
    if (!health) return;
    health.totalRequests++;
    health.isHealthy = true;
    health.failures = 0;
    health.lastSuccess = Date.now();
    // Exponential moving average for response time
    health.avgResponseTime =
      health.totalRequests === 1
        ? responseTime
        : health.avgResponseTime * 0.7 + responseTime * 0.3;
  }

  private recordFailure(url: string): void {
    const health = this.healthMap.get(url);
    if (!health) return;
    health.failures++;
    health.lastFailure = Date.now();
    health.totalRequests++;
    if (health.failures >= FAILURE_THRESHOLD) {
      health.isHealthy = false;
    }
  }

  async fetch(path: string, init?: RequestInit): Promise<Response> {
    const healthy = this.getHealthyEndpoints();

    if (healthy.length === 0) {
      // All endpoints are down; reset all and retry top priority ones
      API_ENDPOINTS.forEach((ep) => {
        const health = this.healthMap.get(ep.url);
        if (health) {
          health.isHealthy = true;
          health.failures = 0;
        }
      });
      return this.fetch(path, init);
    }

    // Try up to 5 endpoints for each request
    const maxAttempts = Math.min(5, healthy.length);
    const startIdx = this.roundRobinOffset % healthy.length;

    for (let i = 0; i < maxAttempts; i++) {
      const idx = (startIdx + i) % healthy.length;
      const ep = healthy[idx];
      const url = `${ep.url}${path}`;
      const startTime = Date.now();

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        const res = await fetch(url, {
          ...init,
          signal: controller.signal,
        });

        clearTimeout(timeout);
        const responseTime = Date.now() - startTime;

        if (res.ok) {
          this.recordSuccess(ep.url, responseTime);
          this.activeIndex = API_ENDPOINTS.indexOf(ep);
          this.roundRobinOffset = idx + 1;
          return res;
        }

        const text = await res.text();
        // JioSaavn specific error codes
        if (text.includes("error code") || text.includes("1027") || res.status === 429) {
          this.recordFailure(ep.url);
          continue;
        }

        // Other non-OK responses - might be valid (e.g., 404 for missing song)
        this.recordSuccess(ep.url, responseTime);
        return new Response(text, { status: res.status, headers: res.headers });
      } catch {
        this.recordFailure(ep.url);
      }
    }

    return new Response("{}", { status: 500 });
  }

  getActiveEndpoint(): ApiEndpoint {
    return API_ENDPOINTS[this.activeIndex];
  }

  getStatus(): {
    total: number;
    healthy: number;
    active: string;
    endpoints: {
      name: string;
      url: string;
      healthy: boolean;
      avgResponseTime: number;
      failures: number;
      totalRequests: number;
    }[];
  } {
    const endpoints = API_ENDPOINTS.map((ep) => {
      const health = this.healthMap.get(ep.url)!;
      return {
        name: ep.name,
        url: ep.url,
        healthy: health.isHealthy,
        avgResponseTime: Math.round(health.avgResponseTime),
        failures: health.failures,
        totalRequests: health.totalRequests,
      };
    });

    return {
      total: API_ENDPOINTS.length,
      healthy: endpoints.filter((e) => e.healthy).length,
      active: API_ENDPOINTS[this.activeIndex].name,
      endpoints,
    };
  }

  getEndpointCount(): number {
    return API_ENDPOINTS.length;
  }
}

// Singleton instance
const apiManager = new ApiManager();
export default apiManager;
