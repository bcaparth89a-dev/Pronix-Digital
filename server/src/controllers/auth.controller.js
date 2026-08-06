import { env } from "../config/env.js";
import { httpStatus } from "../constants/httpStatus.js";
import { authService } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

function requestMeta(req) {
  return {
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshToken, refreshCookieOptions);
}

function clearRefreshCookie(res) {
  res.clearCookie(env.REFRESH_TOKEN_COOKIE_NAME, refreshCookieOptions);
}

export const loginAdmin = asyncHandler(async (req, res) => {
  const result = await authService.loginAdmin(req.validated.body, requestMeta(req));
  setRefreshCookie(res, result.refreshToken);

  res.status(httpStatus.OK).json(
    new ApiResponse(
      httpStatus.OK,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Admin logged in",
    ),
  );
});

export const refreshAdminSession = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.cookies[env.REFRESH_TOKEN_COOKIE_NAME], requestMeta(req));
  setRefreshCookie(res, result.refreshToken);

  res.status(httpStatus.OK).json(
    new ApiResponse(
      httpStatus.OK,
      {
        user: result.user,
        accessToken: result.accessToken,
      },
      "Admin session refreshed",
    ),
  );
});

export const logoutAdmin = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies[env.REFRESH_TOKEN_COOKIE_NAME], requestMeta(req));
  clearRefreshCookie(res);

  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, null, "Admin logged out"));
});

export const getCurrentAdmin = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentAdmin(req.user.sub);
  res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, { user }, "Admin session fetched"));
});

