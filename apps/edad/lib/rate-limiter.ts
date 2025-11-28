/**
 * Simple in-memory rate limiter for API operations
 * Prevents excessive requests to external services
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 5) {
    this.windowMs = windowMs; // 1 minute default
    this.maxRequests = maxRequests; // 5 requests per minute default
  }

  /**
   * Check if a key is rate limited
   */
  isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      return false;
    }

    if (now > entry.resetAt) {
      this.limits.delete(key);
      return false;
    }

    return entry.count >= this.maxRequests;
  }

  /**
   * Record a request for rate limiting
   */
  recordRequest(key: string): void {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetAt) {
      this.limits.set(key, {
        count: 1,
        resetAt: now + this.windowMs,
      });
    } else {
      entry.count++;
    }
  }

  /**
   * Get time until rate limit resets (in milliseconds)
   */
  getResetTime(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;

    const now = Date.now();
    return Math.max(0, entry.resetAt - now);
  }

  /**
   * Clear rate limit for a key
   */
  clear(key: string): void {
    this.limits.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.limits.clear();
  }
}

// Export singleton instances for different platforms
export const generalRateLimiter = new RateLimiter(60000, 10); // 10 requests per minute

export default RateLimiter;

