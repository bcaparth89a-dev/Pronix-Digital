import { httpStatus } from "../constants/httpStatus.js";
import { userDto } from "../dtos/user.dto.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";

export const userService = {
  async list(query) {
    const result = await userRepository.list(query);
    return {
      items: result.items.map(userDto),
      meta: result.meta,
    };
  },

  async getById(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    return userDto(user);
  },

  async update(id, payload) {
    const user = await userRepository.updateById(id, payload);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    return userDto(user);
  },

  async remove(id) {
    const user = await userRepository.deleteById(id);

    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }

    return userDto(user);
  },
};
