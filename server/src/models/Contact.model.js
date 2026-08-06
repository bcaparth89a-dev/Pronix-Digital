import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },
    company: {
      type: String,
      trim: true,
      maxlength: 140,
    },
    serviceInterest: {
      type: String,
      trim: true,
      index: true,
    },
    budgetRange: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    source: {
      type: String,
      trim: true,
      default: "website",
      index: true,
    },
    status: {
      type: String,
      enum: ["new", "in-review", "contacted", "qualified", "closed", "spam"],
      default: "new",
      index: true,
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

contactSchema.index({ name: "text", email: "text", company: "text", message: "text" });

export const Contact = mongoose.model("Contact", contactSchema);

