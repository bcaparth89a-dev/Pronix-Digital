import { RefreshToken } from "../models/RefreshToken.model.js";
import { BaseRepository } from "./base.repository.js";

class RefreshTokenRepository extends BaseRepository {
  constructor() {
    super(RefreshToken);
  }

  findByHash(tokenHash) {
    return this.model.findOne({ tokenHash }).lean();
  }

  revoke(tokenHash, payload = {}) {
    return this.model
      .findOneAndUpdate(
        { tokenHash, revokedAt: { $exists: false } },
        { revokedAt: new Date(), ...payload },
        { new: true },
      )
      .lean();
  }

  revokeAllForUser(userId) {
    return this.model.updateMany(
      { user: userId, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();

