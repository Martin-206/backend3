import { createMockKey, randomItem } from './helpers.js';

const VEHICLE_TYPES = Object.freeze(['MOTORCYCLE', 'VAN', 'TRUCK']);

export function generateMockDriver(index, userMockKey) {
  const uniqueKey = createMockKey('driver');

  return {
    mockKey: uniqueKey,
    userMockKey,
    license_number: `LIC-${Date.now()}-${index}-${uniqueKey.slice(-5)}`,
    vehicle: {
      type: randomItem(VEHICLE_TYPES),
      plate: `SN${String(index).padStart(3, '0')}${uniqueKey.slice(-2)}`.toUpperCase(),
    },
    available: true,
    active: true,
  };
}
