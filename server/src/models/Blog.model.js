import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 320,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    coverImage: {
      url: String,
      publicId: String,
      alt: String,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
    readingTimeMinutes: {
      type: Number,
      min: 1,
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: 160,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 320,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

blogSchema.index({ status: 1, sortOrder: 1, publishedAt: -1, createdAt: -1 });
blogSchema.index({ status: 1, isFeatured: 1, sortOrder: 1, publishedAt: -1, createdAt: -1 });

blogSchema.index({
  title: "text",
  excerpt: "text",
  content: "text",
  category: "text",
  tags: "text",
});

export const Blog = mongoose.model("Blog", blogSchema);
