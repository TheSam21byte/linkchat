import mongoose from "mongoose";
import { getMongoUri } from "./env.js";

export async function connectDB() {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    console.error("Falta MONGO_URI o MONGODB_URI.");
    process.exit(1);
  }

  const options = {};

  if (process.env.MONGO_DB_NAME?.trim()) {
    options.dbName = process.env.MONGO_DB_NAME.trim();
  }

  try {
    await mongoose.connect(mongoUri, options);
    console.log("MongoDB conectado.");
  } catch (error) {
    console.error("Error al conectar MongoDB:", error.message);
    process.exit(1);
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
