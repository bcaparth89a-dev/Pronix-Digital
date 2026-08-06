import { cloudinary } from "../config/cloudinary.js";
import { httpStatus } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadImage = asyncHandler(async (req, res) => {
  const reqReceivedTime = Date.now();
  console.log(`[Upload] Request received at: ${new Date().toISOString()}`);

  if (req.startTime) {
    console.log(`[Upload] Multer processing completed in ${reqReceivedTime - req.startTime}ms`);
  }

  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No file provided");
  }

  const b64StartTime = Date.now();
  const b64 = req.file.buffer.toString("base64");
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;
  console.log(`[Upload] Base64 conversion completed in ${Date.now() - b64StartTime}ms`);

  const cloudinaryStartTime = Date.now();
  console.log("[Upload] Cloudinary upload start...");

  try {
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "pronix-digital",
      resource_type: "auto",
    });
    console.log(`[Upload] Cloudinary upload completed in ${Date.now() - cloudinaryStartTime}ms. Public ID: ${result.public_id}`);

    const responseStartTime = Date.now();
    res.status(httpStatus.OK).json(
      new ApiResponse(
        httpStatus.OK,
        { url: result.secure_url, publicId: result.public_id },
        "Image uploaded",
      ),
    );
    console.log(`[Upload] API success response sent in ${Date.now() - responseStartTime}ms. Total request processing time: ${Date.now() - (req.startTime || reqReceivedTime)}ms`);
  } catch (error) {
    console.error(`[Upload] Cloudinary upload failed in ${Date.now() - cloudinaryStartTime}ms`);
    console.error("Cloudinary Upload Error:", error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export const deleteImage = asyncHandler(async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "publicId is required");
  }

  await cloudinary.uploader.destroy(publicId);

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Image deleted"));
});
