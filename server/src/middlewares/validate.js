import { httpStatus } from "../constants/httpStatus.js";
import { ApiError } from "../utils/ApiError.js";

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    return next(new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Validation failed", result.error.errors));
  }

  req.validated = result.data;
  return next();
};
