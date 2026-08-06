import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 240,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

faqSchema.index({ isActive: 1, sortOrder: 1, order: 1, createdAt: 1 });

faqSchema.index({ question: "text", answer: "text", category: "text" });

export const FAQ = mongoose.model("FAQ", faqSchema);

