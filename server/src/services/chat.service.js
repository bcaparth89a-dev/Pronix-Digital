import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { generateEmbedding } from "./embedding.service.js";
import { KnowledgeChunk } from "../models/KnowledgeChunk.model.js";
import { logger } from "../utils/logger.js";

/**
 * Calculates the dot product of two arrays.
 * Since embeddings are normalized (L2 norm = 1.0), this is equivalent to cosine similarity.
 */
function dotProduct(vecA, vecB) {
  if (vecA.length !== vecB.length) return 0;
  let product = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

/**
 * Main service to process a user chat query, retrieve related facts,
 * build context, request answer from Gemini, and apply confidence rules.
 */
export async function processChat(message) {
  if (!message || typeof message !== "string") {
    throw new Error("Message must be a non-empty string");
  }

  logger.info(`Processing chat request: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

  // 1. Generate query embedding
  logger.info("Generating query embedding via Gemini Embedding API...");
  const queryEmbedding = await generateEmbedding(message);
  logger.info("Successfully generated query embedding.");

  // 2. Query MongoDB using Atlas Vector Search or in-memory fallback
  let matches = [];
  const limit = 5; // Top 5 relevant chunks

  try {
    logger.info("Executing Atlas Vector Search...");
    matches = await KnowledgeChunk.aggregate([
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: limit * 10,
          limit: limit,
        },
      },
    ]);
    logger.info(`Atlas Vector Search found ${matches.length} matching candidate(s).`);
  } catch (err) {
    logger.warn("Atlas Vector Search failed/not supported. Falling back to in-memory matching: " + err.message);
  }

  // If Vector Search returned nothing or failed, use in-memory dot product similarity
  if (!matches || matches.length === 0) {
    logger.info("Executing fallback in-memory vector similarity query on MongoDB...");
    const allItems = await KnowledgeChunk.find({});
    logger.info(`Retrieved ${allItems.length} total knowledge chunks from database. Calculating similarities...`);
    const scored = allItems.map((item) => ({
      content: item.text,
      source: item.sourceFile,
      similarity: dotProduct(queryEmbedding, item.embedding),
    }));

    // Sort by similarity descending
    scored.sort((a, b) => b.similarity - a.similarity);
    matches = scored.slice(0, limit);
    logger.info(`Fallback search completed. Kept top ${matches.length} matches.`);
  }

  // 3. Build context
  const context = matches.map((m) => `[Source: ${m.source || m.sourceFile}]: ${m.content || m.text}`).join("\n\n");
  logger.info(`Retrieved context build size: ${context.length} characters.`);

  // 4. Send to Gemini
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.error("GEMINI_API_KEY is not configured on the server!");
    throw new Error("GEMINI_API_KEY is not configured on the server. Please define it in your .env file.");
  }

  logger.info("Requesting completion from Gemini model 'gemini-2.5-flash'...");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const systemInstruction = `You are Pronix AI, the official AI assistant of Pronix Digital.
Your knowledge comes ONLY from data/knowledgebase.txt after it has been processed through the RAG pipeline.

Below is the retrieved context from data/knowledgebase.txt:
${context}

Rules:
1. ONLY answer using the provided context. If the answer does not exist inside knowledgebase.txt or the retrieved context, or if you are not fully sure about the information, you MUST respond with exactly: "I couldn't find verified information about that in Pronix's knowledge base. Please ask something related to Pronix Digital, its services, products, projects, technologies, team, or company information."
2. Do not hallucinate, speculate, or use outside information for company-specific questions. Never invent company facts.
3. Never mention Gemini or that you have retrieved context, guidelines, or files.
4. Answer naturally, professionally, confidently, and concisely.`;

  const chat = model.startChat({
    history: [],
    generationConfig: {
      temperature: 0.1, // extremely low temperature to minimize hallucinations
    },
  });

  try {
    const result = await chat.sendMessage([
      { text: systemInstruction },
      { text: `User Question: ${message}` },
    ]);

    const responseText = result.response.text();
    logger.info("Successfully received response from Gemini.");
    return responseText.trim();
  } catch (geminiError) {
    logger.error(`Gemini API call failed: ${geminiError.message}`);
    throw geminiError;
  }
}
