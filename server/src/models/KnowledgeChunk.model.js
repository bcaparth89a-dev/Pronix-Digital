import mongoose from "mongoose";

const knowledgeChunkSchema = new mongoose.Schema(
  {
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    tokenCount: {
      type: Number,
      required: true,
    },
    sourceFile: {
      type: String,
      default: "knowledgebase.txt",
    },
  },
  {
    timestamps: true,
    collection: "knowledge_chunks",
    versionKey: false,
  }
);

export const KnowledgeChunk = mongoose.model("KnowledgeChunk", knowledgeChunkSchema);
