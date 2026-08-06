import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectDatabase, disconnectDatabase } from "../db/mongoose.js";
import { ChatbotKnowledge } from "../models/ChatbotKnowledge.model.js";
import { generateEmbedding } from "../services/embedding.service.js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KNOWLEDGE_FILES = [
  "company.txt",
  "services.txt",
  "portfolio.txt",
  "faqs.txt",
  "blogs.txt",
];

async function runIngestion() {
  try {
    // 1. Connect to Database
    logger.info("Connecting to database for ingestion...");
    await connectDatabase();

    // 2. Clear existing chatbot knowledge
    logger.info("Clearing old chatbot knowledge base entries...");
    await ChatbotKnowledge.deleteMany({});

    // 3. Define text splitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 80,
    });

    const dataDir = path.join(__dirname, "..", "..", "data");

    for (const filename of KNOWLEDGE_FILES) {
      const filePath = path.join(dataDir, filename);

      if (!fs.existsSync(filePath)) {
        logger.warn(`Knowledge file not found, skipping: ${filename}`);
        continue;
      }

      logger.info(`Processing knowledge file: ${filename}`);
      const fileContent = fs.readFileSync(filePath, "utf-8");

      // Split text into chunks
      const chunks = await splitter.splitText(fileContent);
      logger.info(`Split ${filename} into ${chunks.length} chunks`);

      // 4. Generate embeddings and save to MongoDB
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i].trim();
        if (!chunkText) continue;

        logger.info(`Generating embedding for chunk ${i + 1}/${chunks.length} of ${filename}...`);
        const embedding = await generateEmbedding(chunkText);

        await ChatbotKnowledge.create({
          content: chunkText,
          embedding,
          source: filename,
        });
      }
    }

    logger.info("Ingestion completed successfully!");
  } catch (error) {
    logger.error("Ingestion failed:", error);
  } finally {
    await disconnectDatabase();
  }
}

runIngestion();
