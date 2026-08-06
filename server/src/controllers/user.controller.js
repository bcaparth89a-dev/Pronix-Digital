import { httpStatus } from "../constants/httpStatus.js";
import { userService } from "../services/user.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.list(req.validated.query);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, result, "Users fetched"));
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getById(req.validated.params.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, user, "User fetched"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.update(req.validated.params.id, req.validated.body);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, user, "User updated"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.remove(req.validated.params.id);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, user, "User deleted"));
});
