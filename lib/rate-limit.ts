import { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Eenvoudige in-memory rate-limiter (per IP, per route-key).
 * Voldoende als basisbescherming tegen spam/brute-force op één instance.
 * In een schaalbare productie-opzet vervang je dit door Upstash/Redis.
 */
export function rateLimit(
  request: NextRequest,
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSeconds: number } {
  const id = `${key}:${clientIp(request)}`;
  const now = Date.now();
  const bucket = buckets.get(id);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { ok: true, retryAfterSeconds: 0 };
}
