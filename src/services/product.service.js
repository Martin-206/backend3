import ProductRepository from '../repositories/product.repository.js';
import { PRODUCT_STATUS } from '../constants/index.js';
import { AppError } from '../utils/app-error.js';



class ProductService {
  static async getAll(filters) {
    return ProductRepository.getAll(filters);
  }

  static async getById(id) {
    const product = await ProductRepository.getById(id);
    if (!product) throw new AppError('Producto no encontrado.', 404);
    return product;
  }

  static async create(productData) {
    const existingProduct = await ProductRepository.getByCode(productData.code);
    if (existingProduct) throw new AppError('Ya existe un producto con ese código.', 409);

    const stock = Number(productData.stock ?? 0);
    const data = {
      ...productData,
      stock,
      status: stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK,
    };

    return ProductRepository.create(data);
  }



  static async update(id, productData) {
    if (productData.code) {
      const productWithCode = await ProductRepository.getByCode(productData.code);
      if (productWithCode && productWithCode._id.toString() !== id) {
        throw new AppError('Ya existe otro producto con ese código.', 409);
      }
    }

    const data = { ...productData };
    if (productData.stock !== undefined) {
      data.stock = Number(productData.stock);
      data.status = data.stock > 0
        ? PRODUCT_STATUS.AVAILABLE
        : PRODUCT_STATUS.OUT_OF_STOCK;
    }


    const product = await ProductRepository.updateById(id, data);
    if (!product) throw new AppError('Producto no encontrado.', 404);
    return product;
  }



  static async remove(id) {
    const product = await ProductRepository.softDeleteById(id);
    if (!product) throw new AppError('Producto no encontrado.', 404);
  }
}

export default ProductService;
