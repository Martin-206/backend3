import { ORDER_PRIORITY, ORDER_STATUS } from '../../constants/index.js';
import { createMockKey, randomItem, randomNumber } from './helpers.js';

const DESCRIPTIONS = Object.freeze([
  'Documentación comercial',
  'Paquete de indumentaria',
  'Repuestos mecánicos',
  'Artículos electrónicos',
  'Insumos de oficina',
]);

const ADDRESSES = Object.freeze([
  'Av. San Martín 1250',
  'Belgrano 840',
  'Rivadavia 2210',
  'Mitre 640',
  'Sarmiento 1735',
]);

export function generateMockOrder(index, userMockKey) {
  const uniqueKey = createMockKey('order');

  return {
    mockKey: uniqueKey,
    userMockKey,
    tracking_code: `SN-${Date.now()}-${index}-${uniqueKey.slice(-6)}`.toUpperCase(),
    description: randomItem(DESCRIPTIONS),
    delivery_address: randomItem(ADDRESSES),
    weight_kg: randomNumber(0.2, 30, 2),
    status: randomItem(Object.values(ORDER_STATUS)),
    priority: randomItem(Object.values(ORDER_PRIORITY)),
    active: true,
  };
}
