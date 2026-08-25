import OrderService from '../services/order.service.js';

class OrderController {
  static async getAll(req, res) {
    const orders = await OrderService.getAll(req.query);
    return res.status(200).json({ status: 'success', payload: orders });
  }

  static async getById(req, res) {
    const order = await OrderService.getById(req.params.id);
    return res.status(200).json({ status: 'success', payload: order });
  }

  static async create(req, res) {
    const order = await OrderService.create(req.body);
    return res.status(201).json({ status: 'success', payload: order });
  }

  static async update(req, res) {
    const order = await OrderService.update(req.params.id, req.body);
    return res.status(200).json({ status: 'success', payload: order });
  }

  static async remove(req, res) {
    await OrderService.remove(req.params.id);
    return res.status(204).send();
  }
}

export default OrderController;
