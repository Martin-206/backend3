import { USER_ROLES } from '../../constants/index.js';
import {
  FIRST_NAMES,
  LAST_NAMES,
  createMockKey,
  randomItem,
} from './helpers.js';

export function generateMockUser(index, role = USER_ROLES.USER) {
  const firstName = randomItem(FIRST_NAMES);
  const lastName = randomItem(LAST_NAMES);
  const uniqueKey = createMockKey('user');

  return {
    mockKey: uniqueKey,
    first_name: firstName,
    last_name: lastName,
    email: `${firstName}.${lastName}.${index}.${uniqueKey.slice(-8)}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s/g, '') + '@shipnow.test',
    password: 'Mock1234!',
    role,
    active: true,
  };
}
