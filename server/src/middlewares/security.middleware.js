/**
 * Prevent NoSQL injection attacks by stripping keys starting with $ or containing .
 * NOTE: req.query is read-only in Express (getter-only property), so we sanitize
 * req.body and req.params (mutable), but for query params we strip dangerous keys
 * using Object.keys iteration without reassignment.
 */
export function mongoSanitize(req, res, next) {
  const sanitize = (obj) => {
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  };
  sanitize(req.body);
  sanitize(req.params);
  // Sanitize query string keys by deleting dangerous entries directly on the parsed object
  // req.query properties are individually writable even though req.query itself is a getter
  if (req.query && typeof req.query === "object") {
    for (const key of Object.keys(req.query)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete req.query[key];
      }
    }
  }
  next();
}

/**
 * XSS cleaning utility for request body and params.
 * Escapes common HTML injection tokens while preserving safe content structure in markdown body properties.
 * NOTE: req.query is not mutated here to avoid read-only property conflicts.
 */
export function xssClean(req, res, next) {
  const cleanInPlace = (obj) => {
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        const val = obj[key];
        if (typeof val === "string") {
          // Allow formatting/rich text fields (Markdown), but strip script and iframe tags entirely
          if (["content", "description", "longDescription", "answer"].includes(key)) {
            obj[key] = val
              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
              .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
          } else {
            // Escape all HTML characters in other fields
            obj[key] = val
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#x27;")
              .replace(/\//g, "&#x2F;");
          }
        } else if (val && typeof val === "object") {
          cleanInPlace(val);
        }
      }
    }
  };

  cleanInPlace(req.body);
  cleanInPlace(req.params);
  next();
}

/**
 * Set restrictive Permissions-Policy header to prevent client feature leaks
 */
export function permissionsPolicy(req, res, next) {
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  next();
}
