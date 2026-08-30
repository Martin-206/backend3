import mongoose from 'mongoose';
import { config } from '../src/config/index.js';

function assertSafeTestDatabase() {
  if (config.NODE_ENV !== 'test') {
    throw new Error('Los tests solo pueden ejecutarse con NODE_ENV=test.');
  }

  if (!config.MONGODB_URI.toLowerCase().includes('test')) {
    throw new Error(
      'Por seguridad, MONGODB_URI de testing debe apuntar a una base cuyo nombre contenga "test".',
    );
  }
}

async function clearDatabase() {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export const mochaHooks = {
  async beforeAll() {
    assertSafeTestDatabase();
    await mongoose.connect(config.MONGODB_URI);
  },

  async beforeEach() {
    await clearDatabase();
  },

  async afterAll() {
    await clearDatabase();
    await mongoose.disconnect();
  },
};
