import { userRepository } from "../repositories/user.repository.js";
import { verifyAccessToken } from "../utils/jwt.js";

export async function optionalAuthenticate(req, _res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await userRepository.findById(decoded.sub);

    if (user?.isActive) {
      req.user = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
      };
    }
  } catch {
    req.user = undefined;
  }

  return next();
}
