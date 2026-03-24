/**
 * Cache utility with TTL (Time To Live) support
 * Provides performant caching for API responses with automatic expiration
 */

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Set data in cache with TTL
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 24h)
 */
export function setCache(key, data, ttl = DEFAULT_TTL) {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Failed to set cache for key "${key}":`, error);
    // Silently fail - cache is not critical
  }
}

/**
 * Get data from cache if not expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/not found
 */
export function getCache(key) {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp, ttl } = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - timestamp > ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Failed to get cache for key "${key}":`, error);
    return null;
  }
}

/**
 * Clear specific cache entry
 * @param {string} key - Cache key
 */
export function clearCache(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to clear cache for key "${key}":`, error);
  }
}

/**
 * Clear all cache entries (useful for logout or cache invalidation)
 * @param {string} prefix - Optional prefix to clear only specific caches
 */
export function clearAllCache(prefix = '') {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear all cache:', error);
  }
}

/**
 * Check if cache exists and is valid
 * @param {string} key - Cache key
 * @returns {boolean} - True if cache exists and not expired
 */
export function hasValidCache(key) {
  return getCache(key) !== null;
}
