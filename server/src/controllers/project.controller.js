import { cloudinary } from "../config/cloudinary.js";
import { httpStatus } from "../constants/httpStatus.js";
import { projectService } from "../services/project.service.js";
import { projectRepository } from "../repositories/project.repository.js";
import { Project } from "../models/Project.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listProjects = asyncHandler(async (req, res) => {
  const result = await projectService.list(req.validated.query, {
    includeUnpublished: req.user?.role === "admin",
  });
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "Projects fetched"));
});

export const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await projectService.getBySlug(req.validated.params.slug, {
    includeUnpublished: req.user?.role === "admin",
  });
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, project, "Project fetched"));
});

export const createProject = asyncHandler(async (req, res) => {
  try {
    const maxProject = await Project.findOne().sort("-sortOrder");
    const nextSortOrder = maxProject ? (maxProject.sortOrder || 0) + 1 : 1;

    const payload = { ...req.validated.body, sortOrder: nextSortOrder };
    const project = await projectService.create(payload);
    res
      .status(httpStatus.CREATED)
      .json(new ApiResponse(httpStatus.CREATED, project, "Project created"));
  } catch (error) {
    if (req.validated?.body?.coverImage?.publicId) {
      console.log(`[Upload] Project creation failed. Deleting orphan coverImage from Cloudinary: ${req.validated.body.coverImage.publicId}`);
      try {
        await cloudinary.uploader.destroy(req.validated.body.coverImage.publicId);
      } catch (destroyError) {
        console.error("[Upload] Failed to clean up orphan image:", destroyError);
      }
    }
    throw error;
  }
});

export const updateProject = asyncHandler(async (req, res) => {
  let existingProject = null;
  try {
    existingProject = await projectService.getById(req.validated.params.id);
  } catch (err) {
    // Ignore error
  }

  try {
    const project = await projectService.update(req.validated.params.id, req.validated.body);
    res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, project, "Project updated"));
  } catch (error) {
    const newPublicId = req.validated?.body?.coverImage?.publicId;
    const oldPublicId = existingProject?.coverImage?.publicId;
    if (newPublicId && newPublicId !== oldPublicId) {
      console.log(`[Upload] Project update failed. Deleting orphan new coverImage: ${newPublicId}`);
      try {
        await cloudinary.uploader.destroy(newPublicId);
      } catch (destroyError) {
        console.error("[Upload] Failed to clean up orphan image:", destroyError);
      }
    }
    throw error;
  }
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await projectService.remove(req.validated.params.id);

  // Normalize remaining project sortOrders starting from 1 with no gaps
  const remaining = await Project.find().sort("sortOrder createdAt");
  for (let i = 0; i < remaining.length; i++) {
    remaining[i].sortOrder = i + 1;
    await remaining[i].save();
  }

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, project, "Project deleted"));
});

export const getProjectById = asyncHandler(async (req, res) => {
  const project = await projectService.getById(req.validated.params.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, project, "Project fetched"));
});

export const reorderProjects = asyncHandler(async (req, res) => {
  const { orders } = req.validated.body;

  await Promise.all(
    orders.map(({ id, sortOrder }) =>
      Project.findByIdAndUpdate(id, { sortOrder }, { new: true })
    )
  );

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Projects reordered successfully"));
});
