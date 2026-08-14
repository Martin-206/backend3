import fs from 'fs';
import path from 'path';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { config } from './index.js';

const LOG_LEVELS = Object.freeze({
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5,
});

const logsDirectory = path.resolve('logs');
fs.mkdirSync(logsDirectory, { recursive: true });

const baseFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
);

const consoleFormat = winston.format.combine(
  baseFormat,
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    const details = Object.keys(metadata).length > 0
      ? ` ${JSON.stringify(metadata)}`
      : '';
    const content = stack ?? message;
    return `${timestamp} [${level}] ${content}${details}`;
  }),
);

const fileFormat = winston.format.combine(
  baseFormat,
  winston.format.json(),
);

const errorFileTransport = new winston.transports.DailyRotateFile({
  dirname: logsDirectory,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxSize: '10m',
  maxFiles: '14d',
  zippedArchive: true,
  format: fileFormat,
});

const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: config.NODE_ENV === 'development' ? 'debug' : 'info',
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    errorFileTransport,
  ],
  exitOnError: false,
});

export { LOG_LEVELS, logger };
