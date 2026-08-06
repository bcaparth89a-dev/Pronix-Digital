const cacheStore = new Map();

/**
 * Clear cache keys starting with a prefix
 * @param {string} prefix
 */
export const clearCache = (prefix) => {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
};

/**
 * Cache middleware for Express GET requests
 * @param {number} durationInSeconds
 * @param {string} prefix
 */
export const cacheMiddleware = (durationInSeconds = 300, prefix = "") => {
  return (req, res, next) => {
    // Only cache GET requests and non-authenticated requests
    if (req.method !== "GET" || req.user) {
      return next();
    }

    const key = `${prefix}:${req.originalUrl || req.url}`;
    const cachedResponse = cacheStore.get(key);

    if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
      res.setHeader("X-Cache", "HIT");
      res.setHeader("Content-Type", "application/json");
      return res.send(cachedResponse.body);
    }

    // Capture the original res.send
    const originalSend = res.send;
    res.send = function (body) {
      if (res.statusCode === 200) {
        cacheStore.set(key, {
          body,
          expiresAt: Date.now() + durationInSeconds * 1000,
        });
      }
      return originalSend.apply(res, arguments);
    };

    next();
  };
};

/**
 * Middleware to clear a cache prefix after successful mutation
 * @param {string} prefix
 */
export const clearCacheMiddleware = (prefix) => {
  return (req, res, next) => {
    res.on("finish", () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        clearCache(prefix);
      }
    });
    next();
  };
};
