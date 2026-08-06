import { USER_ROLES } from '../constants/index.js';
import {
  generateMockDelivery,
  generateMockDriver,
  generateMockOrder,
  generateMockUser,
} from '../mocks/index.js';
import MockRepository from '../repositories/mock.repository.js';
import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';

const DEFAULT_COUNTS = Object.freeze({ users: 10, drivers: 5, orders: 20 });
const MAX_COUNTS = Object.freeze({ users: 100, drivers: 50, orders: 200 });
const ALLOWED_FIELDS = Object.freeze(Object.keys(DEFAULT_COUNTS));

class MockService {
  static normalizeCounts(input = {}) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw CustomError.create(ERROR_CODES.INVALID_MOCK_COUNTS, {
        reason: 'El cuerpo o query debe ser un objeto.',
      });
    }

    const unknownFields = Object.keys(input).filter(
      (field) => !ALLOWED_FIELDS.includes(field),
    );
    if (unknownFields.length > 0) {
      throw CustomError.create(ERROR_CODES.INVALID_MOCK_COUNTS, {
        unknownFields,
        allowedFields: ALLOWED_FIELDS,
      });
    }

    const counts = {
      users: Number(input.users ?? DEFAULT_COUNTS.users),
      drivers: Number(input.drivers ?? DEFAULT_COUNTS.drivers),
      orders: Number(input.orders ?? DEFAULT_COUNTS.orders),
    };

    for (const [name, value] of Object.entries(counts)) {
      if (!Number.isInteger(value) || value < 0 || value > MAX_COUNTS[name]) {
        throw CustomError.create(ERROR_CODES.INVALID_MOCK_COUNTS, {
          field: name,
          received: input[name],
          min: 0,
          max: MAX_COUNTS[name],
        });
      }
    }

    if (counts.orders > 0 && counts.users === 0) {
      throw CustomError.create(ERROR_CODES.MOCK_USERS_REQUIRED);
    }

    return counts;
  }

  static generateDataset(input = {}) {
    const counts = this.normalizeCounts(input);

    const users = Array.from({ length: counts.users }, (_, index) =>
      generateMockUser(index + 1, USER_ROLES.USER));

    const driverUsers = Array.from({ length: counts.drivers }, (_, index) =>
      generateMockUser(index + 1, USER_ROLES.DRIVER));

    const drivers = driverUsers.map((user, index) =>
      generateMockDriver(index + 1, user.mockKey));

    const orders = Array.from({ length: counts.orders }, (_, index) => {
      const user = users[index % users.length];
      return generateMockOrder(index + 1, user.mockKey);
    });

    const deliveries = orders.map((order, index) => {
      const driver = drivers.length > 0 ? drivers[index % drivers.length] : null;
      return generateMockDelivery(order.mockKey, driver?.mockKey ?? null);
    });

    return { users, driverUsers, drivers, orders, deliveries };
  }

  static getPreview(input = {}) {
    const dataset = this.generateDataset(input);

    return {
      users: [...dataset.users, ...dataset.driverUsers].map(({ password, ...user }) => user),
      drivers: dataset.drivers,
      orders: dataset.orders,
      deliveries: dataset.deliveries,
    };
  }

  static async insertTestData(input = {}) {
    const dataset = this.generateDataset(input);

    try {
      const userDocuments = [...dataset.users, ...dataset.driverUsers];
      const insertedUsers = await MockRepository.insertUsers(
        userDocuments.map(({ mockKey, ...user }) => user),
      );

      const userIdByMockKey = new Map(
        userDocuments.map((user, index) => [user.mockKey, insertedUsers[index]._id]),
      );

      const insertedDrivers = await MockRepository.insertDrivers(
        dataset.drivers.map(({ mockKey, userMockKey, ...driver }) => ({
          ...driver,
          user: userIdByMockKey.get(userMockKey),
        })),
      );

      const driverIdByMockKey = new Map(
        dataset.drivers.map((driver, index) => [driver.mockKey, insertedDrivers[index]._id]),
      );

      const insertedOrders = await MockRepository.insertOrders(
        dataset.orders.map(({ mockKey, userMockKey, ...order }) => ({
          ...order,
          user: userIdByMockKey.get(userMockKey),
        })),
      );

      const orderIdByMockKey = new Map(
        dataset.orders.map((order, index) => [order.mockKey, insertedOrders[index]._id]),
      );

      const insertedDeliveries = await MockRepository.insertDeliveries(
        dataset.deliveries.map(({ mockKey, orderMockKey, driverMockKey, ...delivery }) => ({
          ...delivery,
          order: orderIdByMockKey.get(orderMockKey),
          driver: driverMockKey ? driverIdByMockKey.get(driverMockKey) : null,
        })),
      );

      return {
        users: insertedUsers.length,
        drivers: insertedDrivers.length,
        orders: insertedOrders.length,
        deliveries: insertedDeliveries.length,
      };
    } catch (error) {
      if (error?.code === 11000 || error?.name === 'ValidationError') throw error;
      throw CustomError.create(ERROR_CODES.MOCK_INSERTION_FAILED);
    }
  }
}

export default MockService;
