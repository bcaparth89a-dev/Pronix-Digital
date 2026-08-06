import { cloudinary } from "../config/cloudinary.js";

export async function uploadToCloudinary(filePath, options = {}) {
  return cloudinary.uploader.upload(filePath, {
    resource_type: "auto",
    folder: "pronix-digital",
    ...options,
  });
}

export async function deleteFromCloudinary(publicId, options = {}) {
  return cloudinary.uploader.destroy(publicId, options);
}
