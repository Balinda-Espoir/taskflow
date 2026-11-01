import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ path: i.path.slice(1).join('.'), message: i.message }));
    return next(ApiError.badRequest('Validation failed', details));
  }
  const { body, query, params } = result.data;
  if (body) req.body = body;
  if (query) req.query = query;
  if (params) req.params = params;
  next();
};
