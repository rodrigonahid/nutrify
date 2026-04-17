type RateLimitStore = Map<string, number[]>;

const store: RateLimitStore = new Map();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; retryAfter: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const timestamps = (store.get(key) ?? []).filter((t) => t > windowStart);
  timestamps.push(now);
  store.set(key, timestamps);

  if (timestamps.length > limit) {
    const oldest = timestamps[timestamps.length - limit - 1];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { success: false, retryAfter };
  }

  return { success: true, retryAfter: 0 };
}

export function getClientIp(request: Request): string {
  const forwarded = (request.headers as Headers).get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
