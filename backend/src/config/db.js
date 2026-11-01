import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

export async function connectDB(uri) {
  await mongoose.connect(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 10000 });
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
