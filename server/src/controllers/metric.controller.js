import { httpStatus } from "../constants/httpStatus.js";
import { metricService } from "../services/metric.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listMetrics = asyncHandler(async (req, res) => {
  const result = await metricService.list(req.validated.query, {
    includeInactive: req.user?.role === "admin",
  });
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "Metrics fetched"));
});

export const getMetricById = asyncHandler(async (req, res) => {
  const metric = await metricService.getById(req.validated.params.id, {
    includeInactive: req.user?.role === "admin",
  });
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, metric, "Metric fetched"));
});

export const createMetric = asyncHandler(async (req, res) => {
  const metric = await metricService.create(req.validated.body);
  res.status(httpStatus.CREATED).json(new ApiResponse(httpStatus.CREATED, metric, "Metric created"));
});

export const updateMetric = asyncHandler(async (req, res) => {
  const metric = await metricService.update(req.validated.params.id, req.validated.body);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, metric, "Metric updated"));
});

export const deleteMetric = asyncHandler(async (req, res) => {
  const metric = await metricService.remove(req.validated.params.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, metric, "Metric deleted"));
});
