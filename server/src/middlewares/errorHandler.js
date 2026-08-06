import { env } from "../config/env.js";
import { httpStatus } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

function normalizeError(error) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error.name === "ZodError") {
    return new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Validation failed", error.errors);
  }

  if (error.name === "CastError") {
    return new ApiError(httpStatus.BAD_REQUEST, "Invalid resource identifier");
  }

  if (error.code === 11000) {
    return new ApiError(httpStatus.CONFLICT, "Duplicate resource value");
  }

  return new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error");
}

export function errorHandler(error, _req, res, _next) {
  const normalizedError = normalizeError(error);

  if (normalizedError.statusCode >= 500) {
    logger.error(normalizedError.message, error);
  }

  res.status(normalizedError.statusCode).json({
    success: false,
    message: normalizedError.message,
    errors: normalizedError.errors,
    stack: env.NODE_ENV === "production" ? undefined : error.stack,
  });
}
