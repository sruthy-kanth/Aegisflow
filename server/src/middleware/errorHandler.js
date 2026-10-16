import { logger } from '../config/logger.js';
import { sendError } from '../utils/apiResponse.js';

export function errorHandler(err, req, res, next) {
  logger.error({
    err: {
      message: err.message,
      stack: err.stack,
      name: err.name
    },
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  }, 'Unhandled request error');

  if (err.name === 'ValidationError') {
    return sendError(res, 'Validation error', 400, err.errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, `Duplicate value for ${field}. It must be unique.`, 409);
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);

  return sendError(res, message, statusCode);
}
