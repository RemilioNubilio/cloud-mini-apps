/**
 * Simple in-memory cache for scraped profile data
 * Reduces API calls and respects rate limits
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private readonly ttl: number;

  constructor(ttlMs: number = 24 * 60 * 60 * 1000) {
    // 24 hours default
    this.ttl = ttlMs;
  }

  /**
   * Get item from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set item in cache
   */
  set(key: string, data: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.ttl);
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached items
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    // Clean expired entries first
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

// Export singleton instances for different data types
export const profileCache = new SimpleCache<unknown>(24 * 60 * 60 * 1000); // 24 hours

export default SimpleCache;

