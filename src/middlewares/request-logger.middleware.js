import { logger } from '../config/logger.js';

export function requestLogger(req, res, next) {
  const startedAt = Date.now();

  res.on('finish', () => {
    logger.http(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
      durationMs: Date.now() - startedAt,
    });
  });

  next();
}
