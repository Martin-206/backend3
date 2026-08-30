import UserRepository from '../repositories/user.repository.js';
import DeliveryRepository from '../repositories/delivery.repository.js';
import FileService from './file.service.js';
import { USER_DOCUMENT_TYPES } from '../constants/index.js';
import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';
import { logger } from '../config/logger.js';

class UploadService {
  static async addUserDocument(userId, file, documentType) {
    if (!file) throw CustomError.create(ERROR_CODES.FILE_REQUIRED, { expectedField: 'file' });
    if (!Object.values(USER_DOCUMENT_TYPES).includes(documentType)) {
      await FileService.remove(file);
      throw CustomError.create(ERROR_CODES.INVALID_DOCUMENT_TYPE, { allowedValues: Object.values(USER_DOCUMENT_TYPES) });
    }
    let user;
    try {
      user = await UserRepository.getById(userId);
    } catch (error) {
      await FileService.remove(file);
      throw error;
    }
    if (!user) { await FileService.remove(file); throw CustomError.create(ERROR_CODES.USER_NOT_FOUND); }
    const metadata = FileService.buildMetadata(file, documentType);
    try {
      const updated = await UserRepository.addDocument(userId, metadata);
      logger.info('Documento de usuario cargado correctamente', { userId, documentType, storedName: metadata.stored_name });
      return updated;
    } catch (error) {
      await FileService.remove(file);
      logger.error('Error al asociar documento de usuario', { userId, message: error.message });
      throw CustomError.create(ERROR_CODES.FILE_SAVE_ERROR);
    }
  }

  static async addDeliveryProof(deliveryId, file) {
    if (!file) throw CustomError.create(ERROR_CODES.FILE_REQUIRED, { expectedField: 'file' });
    let delivery;
    try {
      delivery = await DeliveryRepository.getById(deliveryId);
    } catch (error) {
      await FileService.remove(file);
      throw error;
    }
    if (!delivery) { await FileService.remove(file); throw CustomError.create(ERROR_CODES.DELIVERY_NOT_FOUND); }
    const metadata = FileService.buildMetadata(file, 'DELIVERY_PROOF');
    try {
      const updated = await DeliveryRepository.addProof(deliveryId, metadata);
      logger.info('Comprobante asociado a una entrega', { deliveryId, storedName: metadata.stored_name });
      return updated;
    } catch (error) {
      await FileService.remove(file);
      logger.error('Error al asociar comprobante de entrega', { deliveryId, message: error.message });
      throw CustomError.create(ERROR_CODES.FILE_SAVE_ERROR);
    }
  }
}
export default UploadService;
