import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) => next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  if (err instanceof ZodError) { status = 400; message = 'Validation failed'; details = err.issues; }
  else if (err.code === 11000) { status = 409; message = 'Duplicate value: resource already exists'; }
  else if (err.name === 'CastError') { status = 400; message = 'Invalid identifier'; }
  else if (err.name === 'ValidationError') { status = 400; message = 'Validation failed'; details = Object.values(err.errors).map((e) => e.message); }

  if (status >= 500) {
    if (!env.isTest) console.error(err);
    if (env.isProd) message = 'Internal server error';
  }
  res.status(status).json({ success: false, message, ...(details ? { details } : {}) });
}
