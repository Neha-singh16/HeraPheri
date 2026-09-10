import { User,  RefreshToken, } from "../models/index.js";
import {
  hashToken,
} from "../utils/tokenHash.js";


import { hashPassword, comparePassword } from "../utils/password.js";

import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "../utils/jwt.js";

import googleClient from "../config/google.js";

export async function registerLocalUser({ name, email, phone, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone?.trim() || null;

  const existingUser = await User.findOne({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new Error("An account with this email already exists.");
  }

  if (normalizedPhone) {
    const existingPhone = await User.findOne({
      where: {
        phone: normalizedPhone,
      },
    });

    if (existingPhone) {
      throw new Error("An account with this phone number already exists.");
    }
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: normalizedPhone,
    password_hash: passwordHash,
    auth_provider: "LOCAL",
  });

  return createAuthResponse(user);
}

//local login
export async function loginLocalUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    where: {
      email: normalizedEmail,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (user.auth_provider !== "LOCAL") {
    throw new Error("This account uses Google Sign-In.");
  }

  const validPassword = await comparePassword(password, user.password_hash);

  if (!validPassword) {
    throw new Error("Invalid email or password.");
  }

  if (user.account_status !== "ACTIVE") {
    throw new Error("Account is not active.");
  }

  return createAuthResponse(user);
}


export async function logoutUser(
  refreshToken
) {
  const tokenHash =
    hashToken(refreshToken);

  const storedToken =
    await RefreshToken.findOne({
      where: {
        token_hash: tokenHash,
      },
    });

  if (!storedToken) {
    return;
  }

  await storedToken.update({
    revoked_at: new Date(),
  });
}

async function createAuthResponse(user) {
  const accessToken =
    generateAccessToken(user);

  const refreshToken =
    generateRefreshToken(user);

  const tokenHash =
    hashToken(refreshToken);

  const expiresAt = new Date(
    Date.now() +
      7 * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
}

export async function loginWithGoogle({ idToken }) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error("Invalid Google account.");
  }

  const { sub: googleId, email, email_verified: emailVerified, name } = payload;
  if (!email || !emailVerified) {
    throw new Error("Google account email is not verified.");
  }

  let user = await User.findOne({
    where: {
      google_id: googleId,
    },
  });

  if (!user) {
    user = await User.findOne({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  if (!user) {
    user = await User.create({
      name: name || "Google User",
      email: email.trim().toLowerCase(),
      phone: null,
      password_hash: null,
      auth_provider: "GOOGLE",
      google_id: googleId,
    });
  } else if (!user.google_id) {
    // Link an existing local account to the verified Google account.
    await user.update({
      google_id: googleId,
    });
  }

  if (user.account_status !== "ACTIVE") {
    throw new Error("Account is not active.");
  }

  return createAuthResponse(user);
}



export async function refreshAccessToken(
  refreshToken
) {
  const payload =
    verifyRefreshToken(refreshToken);

  if (payload.type !== "refresh") {
    throw new Error(
      "Invalid refresh token."
    );
  }

  const tokenHash =
    hashToken(refreshToken);

  const storedToken =
    await RefreshToken.findOne({
      where: {
        token_hash: tokenHash,
      },
    });

  if (!storedToken) {
    throw new Error(
      "Refresh token not found."
    );
  }

  if (storedToken.revoked_at) {
    throw new Error(
      "Refresh token has been revoked."
    );
  }

  if (
    new Date(storedToken.expires_at) <=
    new Date()
  ) {
    throw new Error(
      "Refresh token has expired."
    );
  }

  if (storedToken.user_id !== payload.sub) {
    throw new Error(
      "Invalid refresh token."
    );
  }

  const user =
    await User.findByPk(payload.sub);

  if (!user || user.account_status !== "ACTIVE") {
    throw new Error(
      "User account is not active."
    );
  }

  const newAccessToken =
    generateAccessToken(user);

  return {
    accessToken: newAccessToken,
  };
}