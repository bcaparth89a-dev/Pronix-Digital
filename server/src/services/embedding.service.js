import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";

/**
 * Generate embedding using Gemini Embedding API (gemini-embedding-001).
 * @param {string} text - The input content to embed.
 * @returns {Promise<number[]>} The 3072-dimensional embedding vector.
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Input text must be a non-empty string");
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server. Please define it in your .env file.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  
  const result = await model.embedContent(text);

  if (!result || !result.embedding || !result.embedding.values) {
    throw new Error("Failed to generate embedding from Gemini API");
  }

  return result.embedding.values;
}
