import { httpStatus } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";

export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(httpStatus.FORBIDDEN, "You do not have permission for this action"));
    }

    return next();
  };
};
