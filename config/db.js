import mongoose from 'mongoose';

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();

  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  const maxRetries = Number.parseInt(process.env.MONGO_CONNECT_RETRIES ?? '3', 10);
  const retryDelayMs = Number.parseInt(process.env.MONGO_RETRY_DELAY_MS ?? '2000', 10);
  const serverSelectionTimeoutMS = Number.parseInt(
    process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS ?? '10000',
    10
  );

  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await mongoose.connect(mongoUri, {
        autoIndex: process.env.NODE_ENV !== 'production',
        serverSelectionTimeoutMS
      });
      console.log('MongoDB connected');
      return;
    } catch (error) {
      lastError = error;
      const shouldRetry = attempt < maxRetries;

      console.error(
        `MongoDB connection attempt ${attempt}/${maxRetries} failed: ${error.message}`
      );

      if (!shouldRetry) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  throw new Error(
    `Unable to connect to MongoDB after ${maxRetries} attempt(s). ` +
      'If you are using MongoDB Atlas, verify the connection string and that your current IP address is allowed in Network Access. ' +
      `Last error: ${lastError?.message ?? 'Unknown error'}`
  );
};
