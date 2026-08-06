import { cloudinary } from "../config/cloudinary.js";
import { httpStatus } from "../constants/httpStatus.js";
import { blogService } from "../services/blog.service.js";
import { blogRepository } from "../repositories/blog.repository.js";
import { Blog } from "../models/Blog.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listBlogs = asyncHandler(async (req, res) => {
  const result = await blogService.list(req.validated.query, {
    includeUnpublished: req.user?.role === "admin",
  });
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "Blogs fetched"));
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await blogService.getBySlug(req.validated.params.slug, {
    includeUnpublished: req.user?.role === "admin",
  });
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, blog, "Blog fetched"));
});

export const createBlog = asyncHandler(async (req, res) => {
  try {
    const maxBlog = await Blog.findOne().sort("-sortOrder");
    const nextSortOrder = maxBlog ? (maxBlog.sortOrder || 0) + 1 : 1;

    const payload = { ...req.validated.body, sortOrder: nextSortOrder };
    const blog = await blogService.create(payload);
    res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, blog, "Blog created"));
  } catch (error) {
    if (req.validated?.body?.coverImage?.publicId) {
      console.log(`[Upload] Blog creation failed. Deleting orphan coverImage from Cloudinary: ${req.validated.body.coverImage.publicId}`);
      try {
        await cloudinary.uploader.destroy(req.validated.body.coverImage.publicId);
      } catch (destroyError) {
        console.error("[Upload] Failed to clean up orphan image:", destroyError);
      }
    }
    throw error;
  }
});

export const updateBlog = asyncHandler(async (req, res) => {
  let existingBlog = null;
  try {
    existingBlog = await blogService.getById(req.validated.params.id);
  } catch (err) {
    // Ignore error
  }

  try {
    const blog = await blogService.update(req.validated.params.id, req.validated.body);
    res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, blog, "Blog updated"));
  } catch (error) {
    const newPublicId = req.validated?.body?.coverImage?.publicId;
    const oldPublicId = existingBlog?.coverImage?.publicId;
    if (newPublicId && newPublicId !== oldPublicId) {
      console.log(`[Upload] Blog update failed. Deleting orphan new coverImage: ${newPublicId}`);
      try {
        await cloudinary.uploader.destroy(newPublicId);
      } catch (destroyError) {
        console.error("[Upload] Failed to clean up orphan image:", destroyError);
      }
    }
    throw error;
  }
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await blogService.remove(req.validated.params.id);

  // Normalize remaining blog sortOrders starting from 1 with no gaps
  const remaining = await Blog.find().sort("sortOrder createdAt");
  for (let i = 0; i < remaining.length; i++) {
    remaining[i].sortOrder = i + 1;
    await remaining[i].save();
  }

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, blog, "Blog deleted"));
});

export const getBlogById = asyncHandler(async (req, res) => {
  const blog = await blogService.getById(req.validated.params.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, blog, "Blog fetched"));
});

export const reorderBlogs = asyncHandler(async (req, res) => {
  const { orders } = req.validated.body;

  await Promise.all(
    orders.map(({ id, sortOrder }) =>
      Blog.findByIdAndUpdate(id, { sortOrder }, { new: true })
    )
  );

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Blogs reordered successfully"));
});
