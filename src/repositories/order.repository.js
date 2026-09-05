import OrderModel from '../models/order.model.js';

const ORDER_PUBLIC_FIELDS =
  'tracking_code user description delivery_address weight_kg status priority active createdAt updatedAt';

class OrderRepository {
  static buildFilters(filters = {}) {
    const query = { active: true };

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.user) query.user = filters.user;
    if (filters.search) {
      query.$or = [
        { tracking_code: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { delivery_address: { $regex: filters.search, $options: 'i' } },
      ];
    }

    return query;
  }

  static async getAll(filters = {}, pagination) {
    const query = this.buildFilters(filters);
    const [items, total] = await Promise.all([
      OrderModel.find(query)
        .select(ORDER_PUBLIC_FIELDS)
        .populate('user', 'first_name last_name email role')
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      OrderModel.countDocuments(query),
    ]);
    return { items, total };
  }

  static async getById(id) {
    return OrderModel.findOne({ _id: id, active: true })
      .select(ORDER_PUBLIC_FIELDS)
      .populate('user', 'first_name last_name email role')
      .lean();
  }

  static async getByTrackingCode(trackingCode) {
    return OrderModel.findOne({ tracking_code: trackingCode, active: true })
      .select('_id tracking_code')
      .lean();
  }

  static async create(orderData) {
    const order = await OrderModel.create(orderData);
    return this.getById(order._id);
  }

  static async updateById(id, orderData) {
    const order = await OrderModel.findOneAndUpdate(
      { _id: id, active: true },
      orderData,
      { new: true, runValidators: true },
    );

    if (!order) return null;
    return this.getById(order._id);
  }

  static async softDeleteById(id) {
    return OrderModel.findOneAndUpdate(
      { _id: id, active: true },
      { active: false },
      { new: true },
    )
      .select('_id active')
      .lean();
  }
}

export default OrderRepository;
