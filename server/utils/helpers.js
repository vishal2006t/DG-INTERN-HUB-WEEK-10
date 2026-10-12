/**
 * Standard API response helper utilities
 */

export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data }),
    ...(meta !== null && meta)
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors })
  };
  return res.status(statusCode).json(response);
};

/**
 * Sanitizes input to prevent NoSQL query injection characters ($ and .)
 */
export const sanitizeQuery = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  const clean = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) continue;
    if (typeof obj[key] === 'object') {
      clean[key] = sanitizeQuery(obj[key]);
    } else {
      clean[key] = obj[key];
    }
  }
  return clean;
};
