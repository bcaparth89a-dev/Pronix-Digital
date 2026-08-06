import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { KnowledgeChunk } from "../models/KnowledgeChunk.model.js";
import { generateEmbedding } from "./embedding.service.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KNOWLEDGE_FILE_NAME = "knowledgebase.txt";
const SOURCE_FILES = ["company.txt", "services.txt", "portfolio.txt", "faqs.txt", "blogs.txt"];

/**
 * Helper to count words in an array of blocks.
 */
function getWordCount(blocks) {
  return blocks.join(" ").split(/\s+/).filter(Boolean).length;
}

/**
 * Grabs paragraph blocks from the end to form overlap (approx 80-120 words).
 */
function getOverlapBlocks(blocks, targetOverlapWords) {
  const overlap = [];
  let wordCount = 0;
  for (let i = blocks.length - 1; i >= 0; i--) {
    const blockWords = blocks[i].split(/\s+/).filter(Boolean).length;
    if (wordCount + blockWords > targetOverlapWords && overlap.length > 0) {
      break;
    }
    overlap.unshift(blocks[i]);
    wordCount += blockWords;
  }
  return overlap;
}

/**
 * Intelligent chunker.
 * Rules:
 * - 500-700 words per chunk
 * - 80-120 words overlap (target 100)
 * - Never split headings, sentences, or bullet lists.
 */
export function splitIntelligentChunks(text) {
  const paragraphs = text.split(/\n\s*\n/);
  const chunks = [];
  let currentChunkBlocks = [];
  let currentWordCount = 0;

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    const paraWords = trimmedPara.split(/\s+/).filter(Boolean);
    const paraWordCount = paraWords.length;

    // Check if adding this block would exceed 700 words
    if (currentWordCount + paraWordCount > 700 && currentWordCount >= 500) {
      chunks.push(currentChunkBlocks.join("\n\n"));
      const overlap = getOverlapBlocks(currentChunkBlocks, 100);
      currentChunkBlocks = [...overlap];
      currentWordCount = getWordCount(currentChunkBlocks);
    }

    // If a single paragraph block is over 700 words, split it by sentence
    if (paraWordCount > 700) {
      const sentences = trimmedPara.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        const sentenceWords = sentence.split(/\s+/).filter(Boolean);
        const sentenceWordCount = sentenceWords.length;

        if (currentWordCount + sentenceWordCount > 700 && currentWordCount >= 500) {
          chunks.push(currentChunkBlocks.join("\n\n"));
          const overlap = getOverlapBlocks(currentChunkBlocks, 100);
          currentChunkBlocks = [...overlap];
          currentWordCount = getWordCount(currentChunkBlocks);
        }
        currentChunkBlocks.push(sentence);
        currentWordCount += sentenceWordCount;
      }
    } else {
      currentChunkBlocks.push(trimmedPara);
      currentWordCount += paraWordCount;
    }
  }

  if (currentChunkBlocks.length > 0) {
    chunks.push(currentChunkBlocks.join("\n\n"));
  }

  return chunks;
}

/**
 * Sync the local knowledgebase text file into vector chunk database.
 */
export async function syncKnowledgebaseFile() {
  try {
    const dataDir = path.join(__dirname, "..", "..", "data");
    const filePath = path.join(dataDir, KNOWLEDGE_FILE_NAME);

    if (!fs.existsSync(filePath)) {
      logger.error(`Knowledgebase source file not found at: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(filePath, "utf-8").trim();
    if (!content) {
      logger.warn("Knowledgebase file is empty. Skipping database ingestion.");
      return;
    }

    logger.info(`Starting RAG synchronization of ${KNOWLEDGE_FILE_NAME}...`);

    // 1. Split into intelligent chunks
    const textChunks = splitIntelligentChunks(content);
    logger.info(`Intelligent chunker produced ${textChunks.length} chunks.`);

    // 2. Generate embeddings & counts
    const apiKey = env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

    const newChunksData = [];
    for (let i = 0; i < textChunks.length; i++) {
      const chunkText = textChunks[i];
      logger.info(`Generating Gemini embedding for chunk ${i + 1}/${textChunks.length}...`);

      const embedding = await generateEmbedding(chunkText);
      const { totalTokens } = await model.countTokens(chunkText);

      newChunksData.push({
        chunkIndex: i,
        text: chunkText,
        embedding,
        tokenCount: totalTokens,
        sourceFile: KNOWLEDGE_FILE_NAME,
      });
    }

    // 3. Update database collection atomically (Clear & Insert)
    logger.info("Clearing outdated knowledge chunks in database...");
    await KnowledgeChunk.deleteMany({});
    
    logger.info(`Inserting ${newChunksData.length} fresh knowledge chunks into database...`);
    await KnowledgeChunk.insertMany(newChunksData);

    logger.info("RAG vector database sync completed successfully!");
  } catch (error) {
    logger.error("Failed to sync knowledgebase file:", error);
  }
}

/**
 * Watcher implementation with simple debouncing to prevent rapid triggers.
 */
let watchTimer = null;
function startFileWatcher() {
  const dataDir = path.join(__dirname, "..", "..", "data");
  const filePath = path.join(dataDir, KNOWLEDGE_FILE_NAME);

  logger.info(`Starting file watcher on: ${filePath}`);
  
  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      if (watchTimer) clearTimeout(watchTimer);
      
      watchTimer = setTimeout(async () => {
        logger.info(`Detected change in ${KNOWLEDGE_FILE_NAME}. Re-synchronizing...`);
        await syncKnowledgebaseFile();
      }, 2000); // 2 second debounce
    }
  });
}

/**
 * Main initialization method called on startup.
 */
export async function initializeRAGPipeline() {
  try {
    const dataDir = path.join(__dirname, "..", "..", "data");
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const kbPath = path.join(dataDir, KNOWLEDGE_FILE_NAME);

    // Bootstrap if file does not exist or is empty
    if (!fs.existsSync(kbPath) || fs.statSync(kbPath).size === 0) {
      logger.info("knowledgebase.txt is empty or missing. Bootstrapping from existing text files...");
      let combinedText = "";

      for (const srcFile of SOURCE_FILES) {
        const srcPath = path.join(dataDir, srcFile);
        if (fs.existsSync(srcPath)) {
          const body = fs.readFileSync(srcPath, "utf-8").trim();
          combinedText += `# Section: ${srcFile.replace(".txt", "").toUpperCase()}\n\n${body}\n\n---\n\n`;
        }
      }

      if (!combinedText.trim()) {
        combinedText = "Welcome to Pronix Digital. We build premium software solutions.";
      }

      fs.writeFileSync(kbPath, combinedText, "utf-8");
      logger.info(`Created and pre-populated ${KNOWLEDGE_FILE_NAME} from source files.`);
    }

    // Check if we already have chunks in MongoDB. If we do and we are in production, we can skip!
    const chunkCount = await KnowledgeChunk.countDocuments();
    if (chunkCount > 0 && env.NODE_ENV === "production") {
      logger.info("Knowledge chunks already exist in production database. Skipping RAG synchronization on cold start.");
    } else {
      // Initial sync
      await syncKnowledgebaseFile();
    }

    // Start watching file (only in non-production environments to save resources!)
    if (env.NODE_ENV !== "production") {
      startFileWatcher();
    }
  } catch (error) {
    logger.error("RAG pipeline initialization failed:", error);
  }
}
