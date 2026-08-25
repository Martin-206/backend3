import DeliveryModel from '../models/delivery.model.js';

const DELIVERY_PUBLIC_FIELDS =
  'order driver status estimated_at delivered_at notes active createdAt updatedAt';

class DeliveryRepository {
  static buildFilters(filters = {}) {
    const query = { active: { $ne: false } };

    if (filters.status) query.status = filters.status;
    if (filters.driver) query.driver = filters.driver;
    if (filters.order) query.order = filters.order;

    return query;
  }

  static async getAll(filters = {}) {
    return DeliveryModel.find(this.buildFilters(filters))
      .select(DELIVERY_PUBLIC_FIELDS)
      .populate('order', 'tracking_code status priority delivery_address')
      .populate('driver', 'license_number vehicle available')
      .sort({ createdAt: -1 })
      .lean();
  }

  static async getById(id) {
    return DeliveryModel.findOne({ _id: id, active: { $ne: false } })
      .select(DELIVERY_PUBLIC_FIELDS)
      .populate('order', 'tracking_code status priority delivery_address')
      .populate('driver', 'license_number vehicle available')
      .lean();
  }

  static async getByOrder(orderId) {
    return DeliveryModel.findOne({ order: orderId, active: { $ne: false } })
      .select('_id order status')
      .lean();
  }

  static async create(deliveryData) {
    const delivery = await DeliveryModel.create(deliveryData);
    return this.getById(delivery._id);
  }

  static async updateById(id, deliveryData) {
    const delivery = await DeliveryModel.findOneAndUpdate(
      { _id: id, active: { $ne: false } },
      deliveryData,
      { new: true, runValidators: true },
    );

    if (!delivery) return null;
    return this.getById(delivery._id);
  }

  static async softDeleteById(id) {
    return DeliveryModel.findOneAndUpdate(
      { _id: id, active: { $ne: false } },
      { active: false },
      { new: true },
    )
      .select('_id active')
      .lean();
  }
}

export default DeliveryRepository;
