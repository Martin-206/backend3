import ProductService from '../services/product.service.js';

class ProductController {
  static async getAll(req, res) {
    const products = await ProductService.getAll(req.query);
    return res.status(200).json({ status: 'success', payload: products });
  }

  static async getById(req, res) {
    const product = await ProductService.getById(req.params.id);
    return res.status(200).json({ status: 'success', payload: product });
  }

  static async create(req, res) {
    const product = await ProductService.create(req.body);
    return res.status(201).json({ status: 'success', payload: product });
  }

  static async update(req, res) {
    const product = await ProductService.update(req.params.id, req.body);
    return res.status(200).json({ status: 'success', payload: product });
  }

  static async remove(req, res) {
    await ProductService.remove(req.params.id);
    return res.status(204).send();
  }
}

export default ProductController;
