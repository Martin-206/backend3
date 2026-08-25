import mongoose from 'mongoose';
import { config } from './index.js';
import { logger } from './logger.js';

export async function connectDB() {
  await mongoose.connect(config.MONGODB_URI);
  logger.info('Conexión a MongoDB establecida');
}
