import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isMongoConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kalvium_lessons';
  try {
    mongoose.set('strictQuery', false);
    // Attempt connection with short timeout so server starts instantly even if local MongoDB isn't running
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[Database] Connected to MongoDB at ${mongoUri}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[Database] MongoDB not available (${err.message}). Using local JSON file-based persistent storage.`);
  }
};

export const getDbStatus = () => ({
  isMongoConnected,
  type: isMongoConnected ? 'mongodb' : 'json-file-fallback',
  storagePath: path.resolve(__dirname, '../../data/lessons.json')
});
