import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const common = { standardHeaders: true, legacyHeaders: false, skip: () => env.isTest };

export const globalLimiter = rateLimit({
  ...common, windowMs: 15 * 60 * 1000, limit: 300,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

export const authLimiter = rateLimit({
  ...common, windowMs: 15 * 60 * 1000, limit: 10,
  message: { success: false, message: 'Too many attempts, please try again in 15 minutes.' },
});

// CSRF mitigation for cookie auth: browsers cannot add custom headers cross-site without a CORS preflight,
// and our CORS policy only allows trusted origins. State-changing requests must carry this header.
export const requireCustomHeader = (req, _res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest' && !req.headers.authorization) {
    return next(ApiError.forbidden('Missing X-Requested-With header'));
  }
  next();
};
