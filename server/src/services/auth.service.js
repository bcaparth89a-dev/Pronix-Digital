import { env } from "../config/env.js";
import { httpStatus } from "../constants/httpStatus.js";
import { userDto } from "../dtos/user.dto.js";
import { refreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { sha256 } from "../utils/crypto.js";
import {
  getRefreshTokenExpiresAt,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";

function authPayload(user) {
  return {
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
  };
}

async function issueTokenPair(user, requestMeta = {}, replacedTokenHash) {
  const payload = authPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const tokenHash = sha256(refreshToken);

  await refreshTokenRepository.create({
    user: user._id,
    tokenHash,
    expiresAt: getRefreshTokenExpiresAt(),
    replacedByTokenHash: replacedTokenHash,
    createdByIp: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
  });

  return { accessToken, refreshToken };
}

export const authService = {
  async loginAdmin({ email, password }, requestMeta = {}) {
    console.info("========== LOGIN START ==========");
    console.info("EMAIL RECEIVED:", email);

    const user = await userRepository.findByEmailWithPassword(email);

    console.info("USER FOUND:", user);

    if (!user || user.role !== "admin" || !user.isActive) {
      console.info("USER NOT FOUND OR NOT ADMIN");
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid admin credentials");
    }

    console.info("HASH FROM DB:", user.password);

    const passwordMatches = await comparePassword(password, user.password);

    console.info("PASSWORD MATCH:", passwordMatches);

    if (!passwordMatches) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid admin credentials");
    }

    const tokens = await issueTokenPair(user, requestMeta);

    await userRepository.updateById(user._id, { lastLoginAt: new Date() });

    return {
      user: userDto(user),
      ...tokens,
    };
  },

  async refresh(refreshToken, requestMeta = {}) {
    if (!refreshToken) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token is required");
    }

    let decoded;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
    }

    const tokenHash = sha256(refreshToken);
    const storedToken = await refreshTokenRepository.findByHash(tokenHash);

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
    }

    const user = await userRepository.findById(decoded.sub);

    if (!user || user.role !== "admin" || !user.isActive) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Admin session is no longer valid");
    }

    const tokens = await issueTokenPair(user, requestMeta, tokenHash);

    await refreshTokenRepository.revoke(tokenHash, {
      replacedByTokenHash: sha256(tokens.refreshToken),
      revokedByIp: requestMeta.ipAddress,
    });

    return {
      user: userDto(user),
      ...tokens,
    };
  },

  async logout(refreshToken, requestMeta = {}) {
    if (refreshToken) {
      await refreshTokenRepository.revoke(sha256(refreshToken), {
        revokedByIp: requestMeta.ipAddress,
      });
    }
  },

  async getCurrentAdmin(userId) {
    const user = await userRepository.findById(userId);

    if (!user || user.role !== "admin" || !user.isActive) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Admin session is no longer valid");
    }

    return userDto(user);
  },

  hashPassword,
  refreshCookieName: env.REFRESH_TOKEN_COOKIE_NAME,
};

