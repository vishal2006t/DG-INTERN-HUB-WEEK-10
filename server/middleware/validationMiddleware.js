import mongoose from 'mongoose';
import { sendError } from '../utils/helpers.js';

export const validateBody = (validatorFn) => {
  return (req, res, next) => {
    const { isValid, errors } = validatorFn(req.body);
    if (!isValid) {
      return sendError(res, 400, errors[0] || 'Invalid input data', errors);
    }
    next();
  };
};

export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const val = req.params[paramName];
    // If it's a valid 24 hex char Mongo ID or a valid slug (for jobs)
    if (mongoose.Types.ObjectId.isValid(val) || (typeof val === 'string' && val.length > 2)) {
      return next();
    }
    return sendError(res, 400, `Invalid ID format for parameter '${paramName}'`);
  };
};
