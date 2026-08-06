import { connectDatabase, disconnectDatabase } from "../db/mongoose.js";
import { logger } from "../utils/logger.js";
import { User } from "../models/User.model.js";
import { Blog } from "../models/Blog.model.js";
import { Project } from "../models/Project.model.js";
import { Service } from "../models/Service.model.js";
import { RefreshToken } from "../models/RefreshToken.model.js";
import { Metric } from "../models/Metric.model.js";
import { FAQ } from "../models/FAQ.model.js";
import { Contact } from "../models/Contact.model.js";
import { KnowledgeChunk } from "../models/KnowledgeChunk.model.js";
import { Notification } from "../models/Notification.model.js";

async function main() {
  logger.info("Connecting to database to sync indexes...");
  await connectDatabase();

  const models = [
    User,
    Blog,
    Project,
    Service,
    RefreshToken,
    Metric,
    FAQ,
    Contact,
    KnowledgeChunk,
    Notification,
  ];

  logger.info("Starting index synchronization...");
  for (const model of models) {
    try {
      logger.info(`Syncing indexes for model: ${model.modelName}...`);
      await model.syncIndexes();
      logger.info(`Indexes synced successfully for ${model.modelName}`);
    } catch (error) {
      logger.error(`Failed to sync indexes for ${model.modelName}: ${error.message}`);
    }
  }

  // Programmatically create Atlas Vector Search index if deploying to MongoDB Atlas
  try {
    logger.info("Checking/Creating MongoDB Atlas Vector Search index 'vector_index'...");
    const collection = KnowledgeChunk.collection;

    let indexExists = false;
    try {
      const searchIndexesCursor = collection.listSearchIndexes();
      const indexes = await searchIndexesCursor.toArray();
      indexExists = indexes.some((idx) => idx.name === "vector_index");
    } catch (e) {
      // expected failure if not running on MongoDB Atlas (e.g. local Mongoose connection)
      logger.warn("Could not retrieve existing search indexes (typical for local MongoDB instances): " + e.message);
    }

    if (indexExists) {
      logger.info("Atlas Vector Search index 'vector_index' already exists.");
    } else {
      await collection.createSearchIndex({
        name: "vector_index",
        type: "vectorSearch",
        definition: {
          fields: [
            {
              type: "vector",
              path: "embedding",
              numDimensions: 3072,
              similarity: "cosine",
            },
          ],
        },
      });
      logger.info("Requested creation of Atlas Vector Search index 'vector_index'. This may take a few minutes to build on Atlas.");
    }
  } catch (error) {
    logger.warn(
      "Automatic Atlas Vector Search index request skipped: " +
        error.message +
        "\nNote: If deploying to production on MongoDB Atlas, please check your collection indexes or create the vector search index manually in the MongoDB Atlas dashboard if needed."
    );
  }

  logger.info("Database index synchronization finished.");
}

main()
  .catch((error) => {
    logger.error("Sync indexes failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });
