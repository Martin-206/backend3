import { randomUUID } from 'node:crypto';

export const FIRST_NAMES = Object.freeze([
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elena', 'Facundo', 'Gabriela', 'Hugo',
]);

export const LAST_NAMES = Object.freeze([
  'Gómez', 'Pérez', 'López', 'Fernández', 'Martínez', 'Romero', 'Sosa', 'Torres',
]);

export function randomItem(values) {
  return values[Math.floor(Math.random() * values.length)];
}

export function randomNumber(min, max, decimals = 0) {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

export function createMockKey(prefix) {
  return `${prefix}-${randomUUID()}`;
}

export function futureDate(daysFromNow = 3) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
}
