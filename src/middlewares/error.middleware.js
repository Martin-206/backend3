import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';

function normalizeError(error) {
  if (error instanceof CustomError) return error;

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return CustomError.create(ERROR_CODES.INVALID_INPUT, {
      reason: 'El cuerpo JSON está mal formado.',
    });
  }

  if (error?.name === 'CastError') {
    return CustomError.create(ERROR_CODES.INVALID_ID, { field: error.path });
  }

  if (error?.name === 'ValidationError') {
    const fields = Object.values(error.errors ?? {}).map((item) => ({
      field: item.path,
      message: item.message,
    }));
    return CustomError.create(ERROR_CODES.INVALID_INPUT, fields);
  }

  if (error?.code === 11000) {
    return CustomError.create(ERROR_CODES.DUPLICATE_RESOURCE, error.keyValue ?? null);
  }

  return CustomError.create(ERROR_CODES.INTERNAL_ERROR);
}

export function notFoundHandler(req, res, next) {
  logger.warning('Ruta inexistente solicitada', {
    method: req.method,
    path: req.originalUrl,
  });

  next(CustomError.create(ERROR_CODES.ROUTE_NOT_FOUND, {
    method: req.method,
    path: req.originalUrl,
  }));
}

export function errorHandler(error, req, res, next) {
  const normalizedError = normalizeError(error);

  const logMetadata = {
    code: normalizedError.code,
    statusCode: normalizedError.statusCode,
    method: req.method,
    path: req.originalUrl,
    details: normalizedError.details ?? undefined,
  };

  if (normalizedError.statusCode >= 500) {
    logger.error(error?.stack ?? normalizedError.message, logMetadata);
  } else {
    logger.warning(normalizedError.message, logMetadata);
  }

  const response = {
    status: 'error',
    error: {
      code: normalizedError.code,
      message: normalizedError.message,
    },
  };

  if (normalizedError.details) response.error.details = normalizedError.details;
  if (config.NODE_ENV === 'development' && error?.stack) response.error.stack = error.stack;

  return res.status(normalizedError.statusCode).json(response);
}
