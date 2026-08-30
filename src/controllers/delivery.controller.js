import DeliveryService from '../services/delivery.service.js';
import UploadService from '../services/upload.service.js';

class DeliveryController {
  static async getAll(req, res) {
    const deliveries = await DeliveryService.getAll(req.query);
    return res.status(200).json({ status: 'success', payload: deliveries });
  }

  static async getById(req, res) {
    const delivery = await DeliveryService.getById(req.params.id);
    return res.status(200).json({ status: 'success', payload: delivery });
  }

  static async create(req, res) {
    const delivery = await DeliveryService.create(req.body);
    return res.status(201).json({ status: 'success', payload: delivery });
  }

  static async update(req, res) {
    const delivery = await DeliveryService.update(req.params.id, req.body);
    return res.status(200).json({ status: 'success', payload: delivery });
  }

  static async addProof(req, res) {
    const delivery = await UploadService.addDeliveryProof(req.params.id, req.file);
    return res.status(201).json({ status: 'success', message: 'Comprobante cargado correctamente.', payload: delivery });
  }

  static async remove(req, res) {
    await DeliveryService.remove(req.params.id);
    return res.status(204).send();
  }
}

export default DeliveryController;
