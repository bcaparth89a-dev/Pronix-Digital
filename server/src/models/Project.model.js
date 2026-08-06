import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    industry: {
      type: String,
      trim: true,
      index: true,
    },
    services: [
      {
        type: String,
        trim: true,
      },
    ],
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    coverImage: {
      url: String,
      publicId: String,
      alt: String,
    },
    gallery: [
      {
        url: String,
        publicId: String,
        alt: String,
      },
    ],
    projectUrl: {
      type: String,
      trim: true,
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
    problem: {
      type: String,
      trim: true,
    },
    solution: {
      type: String,
      trim: true,
    },
    results: {
      type: String,
      trim: true,
    },
    githubUrl: {
      type: String,
      trim: true,
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

projectSchema.index({ status: 1, sortOrder: 1, publishedAt: -1, createdAt: -1 });
projectSchema.index({ status: 1, isFeatured: 1, sortOrder: 1, publishedAt: -1, createdAt: -1 });

projectSchema.index({ title: "text", summary: "text", description: "text", industry: "text" });

export const Project = mongoose.model("Project", projectSchema);
