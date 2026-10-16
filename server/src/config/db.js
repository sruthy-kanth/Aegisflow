import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDB() {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: true
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to MongoDB');
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
