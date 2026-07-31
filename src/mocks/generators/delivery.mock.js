import { DELIVERY_STATUS } from '../../constants/index.js';
import { createMockKey, futureDate, randomItem } from './helpers.js';

export function generateMockDelivery(orderMockKey, driverMockKey = null) {
  const assignableStatuses = driverMockKey
    ? [DELIVERY_STATUS.ASSIGNED, DELIVERY_STATUS.IN_TRANSIT]
    : [DELIVERY_STATUS.PENDING];

  return {
    mockKey: createMockKey('delivery'),
    orderMockKey,
    driverMockKey,
    status: randomItem(assignableStatuses),
    estimated_at: futureDate(3),
    delivered_at: null,
    notes: 'Entrega generada por el módulo de mocking.',
  };
}
