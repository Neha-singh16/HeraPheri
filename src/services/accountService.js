import { User } from "../models/index.js";
import { comparePassword, hashPassword } from "../utils/password.js";

const PHONE_PATTERN = /^\+?[0-9 ()-]{7,20}$/;

function serializeUser(user) {
  const data = user.toJSON ? user.toJSON() : { ...user };
  delete data.password_hash;
  delete data.google_id;
  return data;
}

export async function updateUserProfile({ userId, name, phone }) {
  const normalizedName = name?.trim();
  const normalizedPhone = phone?.trim() || null;

  if (!normalizedName || normalizedName.length < 2 || normalizedName.length > 100) {
    throw new Error("Name must be between 2 and 100 characters.");
  }

  if (normalizedPhone && !PHONE_PATTERN.test(normalizedPhone)) {
    throw new Error("Please enter a valid phone number.");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User no longer exists.");
  }

  if (normalizedPhone && normalizedPhone !== user.phone) {
    const existingPhone = await User.findOne({
      where: { phone: normalizedPhone },
    });

    if (existingPhone && existingPhone.id !== user.id) {
      throw new Error("An account with this phone number already exists.");
    }
  }

  await user.update({
    name: normalizedName,
    phone: normalizedPhone,
  });

  return serializeUser(user);
}

export async function updateNotificationPreferences({ userId, preferences }) {
  const allowedKeys = [
    "activityNotifications",
    "paymentUpdates",
    "deadlineReminders",
    "soundFeedback",
  ];

  const invalidKey = Object.keys(preferences || {}).find(
    (key) => !allowedKeys.includes(key),
  );

  if (invalidKey) {
    throw new Error("Invalid notification preference.");
  }

  const invalidValue = Object.values(preferences || {}).some(
    (value) => typeof value !== "boolean",
  );

  if (invalidValue) {
    throw new Error("Notification preferences must be boolean values.");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User no longer exists.");
  }

  const current = user.notification_preferences || {};
  const next = { ...current, ...preferences };
  await user.update({ notification_preferences: next });

  return next;
}

export async function changeUserPassword({ userId, currentPassword, newPassword }) {
  if (!currentPassword || !newPassword) {
    throw new Error("Current password and new password are required.");
  }

  if (newPassword.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User no longer exists.");
  }

  if (user.auth_provider !== "LOCAL" || !user.password_hash) {
    throw new Error("Password changes are unavailable for Google accounts.");
  }

  const matches = await comparePassword(currentPassword, user.password_hash);
  if (!matches) {
    throw new Error("Current password is incorrect.");
  }

  await user.update({ password_hash: await hashPassword(newPassword) });
}
