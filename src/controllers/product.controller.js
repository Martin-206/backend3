import ProductService from '../services/product.service.js';

class ProductController {
  static async getAll(req, res, next) {
    try {
      const products = await ProductService.getAll(req.query);
      res.status(200).json({ status: 'success', payload: products });
    } catch (error) { next(error); }
  }

  static async getById(req, res, next) {
    try {
      const product = await ProductService.getById(req.params.id);
      res.status(200).json({ status: 'success', payload: product });
    } catch (error) { next(error); }
  }

  static async create(req, res, next) {
    try {
      const product = await ProductService.create(req.body);
      res.status(201).json({ status: 'success', payload: product });
    } catch (error) { next(error); }
  }

  static async update(req, res, next) {
    try {
      const product = await ProductService.update(req.params.id, req.body);
      res.status(200).json({ status: 'success', payload: product });
    } catch (error) { next(error); }
  }

  static async remove(req, res, next) {
    try {
      await ProductService.remove(req.params.id);
      res.status(204).send();
    } catch (error) { next(error); }
  }
}

export default ProductController;
