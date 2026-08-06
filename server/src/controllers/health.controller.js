import { httpStatus } from "../constants/httpStatus.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getApiHealth = asyncHandler(async (_req, res) => {
  res.status(httpStatus.OK).json(
    new ApiResponse(
      httpStatus.OK,
      {
        service: "pronix-api",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      "API is healthy",
    ),
  );
});
