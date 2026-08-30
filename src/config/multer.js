import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import multer from 'multer';
import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';
import { logger } from './logger.js';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_MIME_TYPES = Object.freeze(['application/pdf', 'image/jpeg', 'image/png']);

function createStorage(folder) {
  return multer.diskStorage({
    destination(req, file, cb) {
      const dir = path.resolve('uploads', folder);
      try {
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      } catch (error) {
        cb(error);
      }
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${randomUUID()}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    logger.warning('Intento de carga con tipo de archivo no permitido', { mimetype: file.mimetype, originalName: file.originalname });
    return cb(CustomError.create(ERROR_CODES.INVALID_FILE_TYPE, { allowedMimeTypes: ALLOWED_MIME_TYPES }));
  }
  return cb(null, true);
}

function createUploader(folder) {
  return multer({ storage: createStorage(folder), limits: { fileSize: MAX_FILE_SIZE, files: 1 }, fileFilter });
}

export const userDocumentUploader = createUploader('user-documents');
export const deliveryProofUploader = createUploader('delivery-proofs');
