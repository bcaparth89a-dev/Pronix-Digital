import multer from "multer";
import { Router } from "express";
import { deleteImage, uploadImage } from "../controllers/upload.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    const allowedExtensions = /\.(jpg|jpeg|png|webp|gif|svg)$/i;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only Jpeg, Png, Webp, Gif, and Svg images are allowed"), false);
    }

    if (!allowedExtensions.test(file.originalname)) {
      return cb(new Error("Invalid file extension"), false);
    }

    cb(null, true);
  },
});

export const uploadRouter = Router();

uploadRouter.post(
  "/image",
  authenticate,
  authorize("admin"),
  (req, res, next) => {
    req.startTime = Date.now();
    next();
  },
  upload.single("file"),
  uploadImage
);
uploadRouter.delete("/image", authenticate, authorize("admin"), deleteImage);
