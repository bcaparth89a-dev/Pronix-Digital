import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

function getExpiresAt(expiresIn) {
  const decoded = jwt.decode(jwt.sign({}, env.JWT_REFRESH_SECRET, { expiresIn, algorithm: "HS256" }));
  return new Date(decoded.exp * 1000);
}

export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
    algorithm: "HS256",
  });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    algorithm: "HS256",
  });
}

export function getRefreshTokenExpiresAt() {
  return getExpiresAt(env.JWT_REFRESH_EXPIRES_IN);
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ["HS256"] });
}
