import mongoose from "mongoose";

const metricSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    order: {
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

metricSchema.index({ isActive: 1, order: 1 });

export const Metric = mongoose.model("Metric", metricSchema);
