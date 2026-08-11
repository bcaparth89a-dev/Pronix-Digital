import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { metricService } from "../services/metric.service.js";
import { serviceService } from "../services/service.service.js";
import { initializeRAGPipeline } from "../services/rag.service.js";
import { seedDefaultTasks } from "../scripts/seedTasks.js";

mongoose.set("strictQuery", true);

export async function connectDatabase() {
  await mongoose.connect(env.MONGODB_URI, {
    autoIndex: env.NODE_ENV !== "production",
    maxPoolSize: 20,
    minPoolSize: 5,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
  });

  logger.info("MongoDB connected");

  // Clean up legacy collections if present
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map(c => c.name);
    
    if (names.includes("chatbot_config")) {
      await mongoose.connection.db.dropCollection("chatbot_config");
      logger.info("Dropped legacy collection: chatbot_config");
    }
    if (names.includes("chatbot_knowledge")) {
      await mongoose.connection.db.dropCollection("chatbot_knowledge");
      logger.info("Dropped legacy collection: chatbot_knowledge");
    }
  } catch (err) {
    logger.warn("Could not check/drop legacy collections: " + err.message);
  }

  // Drop legacy unique index on replacedByTokenHash if it exists
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: "refreshtokens" }).toArray();
    if (collections.length > 0) {
      const indexes = await db.collection("refreshtokens").indexes();
      if (indexes.some(idx => idx.name === "replacedByTokenHash_1")) {
        await db.collection("refreshtokens").dropIndex("replacedByTokenHash_1");
        logger.info("Successfully dropped unique index replacedByTokenHash_1 from refreshtokens");
      }
    }
  } catch (err) {
    logger.warn("Could not check/drop replacedByTokenHash_1 index: " + err.message);
  }

  await metricService.seedDefaultMetrics();
  await serviceService.seedDefaultServices();
  await seedDefaultTasks();
  await initializeRAGPipeline();
}


export async function disconnectDatabase() {
  await mongoose.disconnect();
  logger.info("MongoDB disconnected");
}
