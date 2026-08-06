import { httpStatus } from "../constants/httpStatus.js";
import { serviceService } from "../services/service.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listServices = asyncHandler(async (req, res) => {
  const result = await serviceService.list(req.validated.query, {
    includeInactive: req.user?.role === "admin",
  });
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "Services fetched"));
});

export const getServiceById = asyncHandler(async (req, res) => {
  const service = await serviceService.getById(req.validated.params.id, {
    includeInactive: req.user?.role === "admin",
  });
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, service, "Service fetched"));
});

export const createService = asyncHandler(async (req, res) => {
  const service = await serviceService.create(req.validated.body);
  res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, service, "Service created"));
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await serviceService.update(req.validated.params.id, req.validated.body);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, service, "Service updated"));
});

export const deleteService = asyncHandler(async (req, res) => {
  const service = await serviceService.remove(req.validated.params.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, service, "Service deleted"));
});
