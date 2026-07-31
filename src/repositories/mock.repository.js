import UserModel from '../models/user.model.js';
import DriverModel from '../models/driver.model.js';
import OrderModel from '../models/order.model.js';
import DeliveryModel from '../models/delivery.model.js';

class MockRepository {
  static async insertUsers(users) {
    return UserModel.insertMany(users, { ordered: true });
  }

  static async insertDrivers(drivers) {
    return DriverModel.insertMany(drivers, { ordered: true });
  }

  static async insertOrders(orders) {
    return OrderModel.insertMany(orders, { ordered: true });
  }

  static async insertDeliveries(deliveries) {
    return DeliveryModel.insertMany(deliveries, { ordered: true });
  }
}

export default MockRepository;
