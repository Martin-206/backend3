import ProductRepository from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';

class ProductService {
  static validateRequiredFields(productData = {}) {
    const requiredFields = ['title', 'code', 'price', 'category'];
    const missingFields = requiredFields.filter((field) => {
      const value = productData[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missingFields.length > 0) {
      throw CustomError.create(ERROR_CODES.INVALID_INPUT, { missingFields });
    }

    const price = Number(productData.price);
    const stock = Number(productData.stock ?? 0);
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) {
      throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
        reason: 'price y stock deben ser números mayores o iguales a cero.',
      });
    }
  }

  static async getAll(filters) {
    if (filters.status && !Object.values(PRODUCT_STATUS).includes(filters.status)) {
      throw CustomError.create(ERROR_CODES.INVALID_PRODUCT_STATUS, {
        allowedValues: Object.values(PRODUCT_STATUS),
      });
    }
    return ProductRepository.getAll(filters);
  }

  static async getById(id) {
    const product = await ProductRepository.getById(id);
    if (!product) throw CustomError.create(ERROR_CODES.PRODUCT_NOT_FOUND);
    return product;
  }

  static async create(productData) {
    this.validateRequiredFields(productData);

    const existingProduct = await ProductRepository.getByCode(productData.code);
    if (existingProduct) {
      throw CustomError.create(ERROR_CODES.PRODUCT_CODE_ALREADY_EXISTS);
    }

    const stock = Number(productData.stock ?? 0);
    const data = {
      ...productData,
      price: Number(productData.price),
      stock,
      status: stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK,
    };

    return ProductRepository.create(data);
  }

  static async update(id, productData) {
    if (!productData || Object.keys(productData).length === 0) {
      throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
        reason: 'Debe enviar al menos un campo para actualizar.',
      });
    }

    if (productData.code) {
      const productWithCode = await ProductRepository.getByCode(productData.code);
      if (productWithCode && productWithCode._id.toString() !== id) {
        throw CustomError.create(ERROR_CODES.PRODUCT_CODE_ALREADY_EXISTS);
      }
    }

    const data = { ...productData };

    if (productData.price !== undefined) {
      data.price = Number(productData.price);
      if (!Number.isFinite(data.price) || data.price < 0) {
        throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
          reason: 'price debe ser un número mayor o igual a cero.',
        });
      }
    }

    if (productData.stock !== undefined) {
      data.stock = Number(productData.stock);
      if (!Number.isFinite(data.stock) || data.stock < 0) {
        throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
          reason: 'stock debe ser un número mayor o igual a cero.',
        });
      }
      data.status = data.stock > 0
        ? PRODUCT_STATUS.AVAILABLE
        : PRODUCT_STATUS.OUT_OF_STOCK;
    }

    const product = await ProductRepository.updateById(id, data);
    if (!product) throw CustomError.create(ERROR_CODES.PRODUCT_NOT_FOUND);
    return product;
  }

  static async remove(id) {
    const product = await ProductRepository.softDeleteById(id);
    if (!product) throw CustomError.create(ERROR_CODES.PRODUCT_NOT_FOUND);
  }
}

export default ProductService;
