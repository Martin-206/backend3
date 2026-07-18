import mongoose from 'mongoose';
import { config } from './index.js';

export async function connectDB() {
  await mongoose.connect(config.MONGODB_URI);
  console.log('MongoDB conectado correctamente');
}
