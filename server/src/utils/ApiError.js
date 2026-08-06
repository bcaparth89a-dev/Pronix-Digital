import { httpStatus } from "../constants/httpStatus.js";

export class ApiError extends Error {
  constructor(
    statusCode = httpStatus.INTERNAL_SERVER_ERROR,
    message = "Internal server error",
    errors = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
