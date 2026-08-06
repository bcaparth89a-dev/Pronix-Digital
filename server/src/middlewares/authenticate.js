import { httpStatus } from "../constants/httpStatus.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Authentication token is required"));
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await userRepository.findById(decoded.sub);

    if (!user || !user.isActive) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "User session is no longer valid"));
    }

    req.user = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return next();
  } catch {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired authentication token"));
  }
}
