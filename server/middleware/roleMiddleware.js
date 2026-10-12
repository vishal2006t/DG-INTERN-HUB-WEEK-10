import { sendError } from '../utils/helpers.js';

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied: role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};
