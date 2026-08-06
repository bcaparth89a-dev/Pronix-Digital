import { httpStatus } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, _res, next) {
  next(new ApiError(httpStatus.NOT_FOUND, `Route not found: ${req.originalUrl}`));
}
