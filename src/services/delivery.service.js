import DeliveryRepository from '../repositories/delivery.repository.js';
import OrderRepository from '../repositories/order.repository.js';
import DriverRepository from '../repositories/driver.repository.js';
import { DELIVERY_STATUS } from '../constants/index.js';
import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';
import { logger } from '../config/logger.js';

class DeliveryService {
  static validateRequiredFields(deliveryData = {}) {
    const requiredFields = ['order', 'estimated_at'];
    const missingFields = requiredFields.filter((field) => {
      const value = deliveryData[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missingFields.length > 0) {
      throw CustomError.create(ERROR_CODES.INVALID_INPUT, { missingFields });
    }
  }

  static validateStatus(status) {
    if (status && !Object.values(DELIVERY_STATUS).includes(status)) {
      throw CustomError.create(ERROR_CODES.INVALID_DELIVERY_STATUS, {
        allowedValues: Object.values(DELIVERY_STATUS),
      });
    }
  }

  static validateDate(value, field) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
        reason: `${field} debe ser una fecha válida.`,
      });
    }
    return date;
  }

  static async validateDriver(driverId) {
    if (!driverId) return null;
    const driver = await DriverRepository.getById(driverId);
    if (!driver) throw CustomError.create(ERROR_CODES.DRIVER_NOT_FOUND);
    return driver;
  }

  static async getAll(filters = {}) {
    this.validateStatus(filters.status);
    return DeliveryRepository.getAll(filters);
  }

  static async getById(id) {
    const delivery = await DeliveryRepository.getById(id);
    if (!delivery) throw CustomError.create(ERROR_CODES.DELIVERY_NOT_FOUND);
    return delivery;
  }

  static async create(deliveryData) {
    this.validateRequiredFields(deliveryData);
    this.validateStatus(deliveryData.status);

    const order = await OrderRepository.getById(deliveryData.order);
    if (!order) throw CustomError.create(ERROR_CODES.ORDER_NOT_FOUND);

    const existingDelivery = await DeliveryRepository.getByOrder(deliveryData.order);
    if (existingDelivery) throw CustomError.create(ERROR_CODES.DELIVERY_ALREADY_EXISTS);

    await this.validateDriver(deliveryData.driver);

    const status = deliveryData.status ?? DELIVERY_STATUS.PENDING;
    const data = {
      ...deliveryData,
      status,
      estimated_at: this.validateDate(deliveryData.estimated_at, 'estimated_at'),
    };

    if (deliveryData.delivered_at) {
      data.delivered_at = this.validateDate(deliveryData.delivered_at, 'delivered_at');
    } else if (status === DELIVERY_STATUS.DELIVERED) {
      data.delivered_at = new Date();
    }

    const delivery = await DeliveryRepository.create(data);
    logger.info('Entrega creada correctamente', {
      deliveryId: delivery._id,
      orderId: deliveryData.order,
    });
    return delivery;
  }

  static async update(id, deliveryData) {
    if (!deliveryData || Object.keys(deliveryData).length === 0) {
      throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
        reason: 'Debe enviar al menos un campo para actualizar.',
      });
    }

    this.validateStatus(deliveryData.status);
    const data = { ...deliveryData };

    if (deliveryData.order) {
      const order = await OrderRepository.getById(deliveryData.order);
      if (!order) throw CustomError.create(ERROR_CODES.ORDER_NOT_FOUND);

      const deliveryForOrder = await DeliveryRepository.getByOrder(deliveryData.order);
      if (deliveryForOrder && deliveryForOrder._id.toString() !== id) {
        throw CustomError.create(ERROR_CODES.DELIVERY_ALREADY_EXISTS);
      }
    }

    if (deliveryData.driver !== undefined) {
      await this.validateDriver(deliveryData.driver);
    }

    if (deliveryData.estimated_at !== undefined) {
      data.estimated_at = this.validateDate(deliveryData.estimated_at, 'estimated_at');
    }

    if (deliveryData.delivered_at !== undefined && deliveryData.delivered_at !== null) {
      data.delivered_at = this.validateDate(deliveryData.delivered_at, 'delivered_at');
    }

    if (deliveryData.status === DELIVERY_STATUS.DELIVERED && !deliveryData.delivered_at) {
      data.delivered_at = new Date();
    }

    const delivery = await DeliveryRepository.updateById(id, data);
    if (!delivery) throw CustomError.create(ERROR_CODES.DELIVERY_NOT_FOUND);

    logger.info('Entrega actualizada correctamente', { deliveryId: id });
    return delivery;
  }

  static async remove(id) {
    const delivery = await DeliveryRepository.softDeleteById(id);
    if (!delivery) throw CustomError.create(ERROR_CODES.DELIVERY_NOT_FOUND);
    logger.info('Entrega eliminada lógicamente', { deliveryId: id });
  }
}

export default DeliveryService;
