import jwt from "jsonwebtoken";
import crypto from "crypto";

export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      type: "access",
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn:
        process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    }
  );
}

export function generateRefreshToken(user) {
  const tokenId = crypto.randomUUID();

  const token = jwt.sign(
    {
      sub: user.id,
      jti: tokenId,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn:
        process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );

  return token;
}

export function verifyAccessToken(token) {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET
  );
}

export function verifyRefreshToken(token) {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET
  );
}