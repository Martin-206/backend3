import OrderRepository from '../repositories/order.repository.js';
import UserRepository from '../repositories/user.repository.js';
import { ORDER_PRIORITY, ORDER_STATUS } from '../constants/index.js';
import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';
import { logger } from '../config/logger.js';

class OrderService {
  static validateRequiredFields(orderData = {}) {
    const requiredFields = [
      'tracking_code',
      'user',
      'description',
      'delivery_address',
      'weight_kg',
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = orderData[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missingFields.length > 0) {
      throw CustomError.create(ERROR_CODES.INVALID_INPUT, { missingFields });
    }
  }

  static validateStatus(status) {
    if (status && !Object.values(ORDER_STATUS).includes(status)) {
      throw CustomError.create(ERROR_CODES.INVALID_ORDER_STATUS, {
        allowedValues: Object.values(ORDER_STATUS),
      });
    }
  }

  static validatePriority(priority) {
    if (priority && !Object.values(ORDER_PRIORITY).includes(priority)) {
      throw CustomError.create(ERROR_CODES.INVALID_ORDER_PRIORITY, {
        allowedValues: Object.values(ORDER_PRIORITY),
      });
    }
  }

  static validateWeight(weight) {
    const parsedWeight = Number(weight);
    if (!Number.isFinite(parsedWeight) || parsedWeight < 0.1) {
      throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
        reason: 'weight_kg debe ser un número mayor o igual a 0.1.',
      });
    }
    return parsedWeight;
  }

  static async getAll(filters = {}) {
    this.validateStatus(filters.status);
    this.validatePriority(filters.priority);
    return OrderRepository.getAll(filters);
  }

  static async getById(id) {
    const order = await OrderRepository.getById(id);
    if (!order) {
      logger.warning('Pedido no encontrado', { orderId: id });
      throw CustomError.create(ERROR_CODES.ORDER_NOT_FOUND);
    }
    return order;
  }

  static async create(orderData) {
    this.validateRequiredFields(orderData);
    this.validateStatus(orderData.status);
    this.validatePriority(orderData.priority);

    const user = await UserRepository.getById(orderData.user);
    if (!user) throw CustomError.create(ERROR_CODES.USER_NOT_FOUND);

    const existingOrder = await OrderRepository.getByTrackingCode(orderData.tracking_code);
    if (existingOrder) throw CustomError.create(ERROR_CODES.TRACKING_CODE_ALREADY_EXISTS);

    const data = {
      ...orderData,
      weight_kg: this.validateWeight(orderData.weight_kg),
      status: orderData.status ?? ORDER_STATUS.PENDING,
      priority: orderData.priority ?? ORDER_PRIORITY.NORMAL,
    };

    const order = await OrderRepository.create(data);
    logger.info('Pedido creado correctamente', {
      orderId: order._id,
      trackingCode: order.tracking_code,
    });
    return order;
  }

  static async update(id, orderData) {
    if (!orderData || Object.keys(orderData).length === 0) {
      throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
        reason: 'Debe enviar al menos un campo para actualizar.',
      });
    }

    this.validateStatus(orderData.status);
    this.validatePriority(orderData.priority);

    if (orderData.user) {
      const user = await UserRepository.getById(orderData.user);
      if (!user) throw CustomError.create(ERROR_CODES.USER_NOT_FOUND);
    }

    if (orderData.tracking_code) {
      const orderWithTracking = await OrderRepository.getByTrackingCode(orderData.tracking_code);
      if (orderWithTracking && orderWithTracking._id.toString() !== id) {
        throw CustomError.create(ERROR_CODES.TRACKING_CODE_ALREADY_EXISTS);
      }
    }

    const data = { ...orderData };
    if (orderData.weight_kg !== undefined) {
      data.weight_kg = this.validateWeight(orderData.weight_kg);
    }

    const order = await OrderRepository.updateById(id, data);
    if (!order) throw CustomError.create(ERROR_CODES.ORDER_NOT_FOUND);

    logger.info('Pedido actualizado correctamente', { orderId: id });
    return order;
  }

  static async remove(id) {
    const order = await OrderRepository.softDeleteById(id);
    if (!order) throw CustomError.create(ERROR_CODES.ORDER_NOT_FOUND);
    logger.info('Pedido eliminado lógicamente', { orderId: id });
  }
}

export default OrderService;
