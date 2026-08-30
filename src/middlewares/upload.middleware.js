import multer from 'multer';
import { userDocumentUploader, deliveryProofUploader, MAX_FILE_SIZE } from '../config/multer.js';
import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';
import { logger } from '../config/logger.js';

function wrapUpload(middleware) {
  return (req, res, next) => middleware(req, res, (error) => {
    if (!error) return next();
    if (error instanceof CustomError) return next(error);
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') return next(CustomError.create(ERROR_CODES.FILE_TOO_LARGE, { maxBytes: MAX_FILE_SIZE }));
      if (error.code === 'LIMIT_UNEXPECTED_FILE') return next(CustomError.create(ERROR_CODES.UNEXPECTED_FILE_FIELD, { expectedField: 'file', receivedField: error.field }));
    }
    logger.error('Error de Multer al guardar un archivo', { message: error.message, code: error.code });
    return next(CustomError.create(ERROR_CODES.FILE_SAVE_ERROR));
  });
}

export const uploadUserDocument = wrapUpload(userDocumentUploader.single('file'));
export const uploadDeliveryProof = wrapUpload(deliveryProofUploader.single('file'));
