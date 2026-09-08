import {
  ExecutorProfile,
} from "../models/index.js";

// Create an Executor profile for a user.
export async function createExecutorProfile({
  userId,
  bio,
}) {
  const existingProfile =
    await ExecutorProfile.findOne({
      where: {
        user_id: userId,
      },
    });

  if (existingProfile) {
    throw new Error(
      "Executor profile already exists."
    );
  }

  const profile =
    await ExecutorProfile.create({
      user_id: userId,
      bio: bio?.trim() || null,
    });

  return profile;
}

// Get the logged-in user's Executor profile.
export async function getExecutorProfile(
  userId
) {
  const profile =
    await ExecutorProfile.findOne({
      where: {
        user_id: userId,
      },
    });

  if (!profile) {
    throw new Error(
      "Executor profile not found."
    );
  }

  return profile;
}

// Turn Executor availability on/off.
export async function updateAvailability({
  userId,
  isAvailable,
}) {
  const profile =
    await ExecutorProfile.findOne({
      where: {
        user_id: userId,
      },
    });

  if (!profile) {
    throw new Error(
      "Create an Executor profile first."
    );
  }

  await profile.update({
    is_available: isAvailable,
  });

  return profile;
}

// Update the current Executor location.
export async function updateLocation({
  userId,
  latitude,
  longitude,
}) {
  const profile =
    await ExecutorProfile.findOne({
      where: {
        user_id: userId,
      },
    });

  if (!profile) {
    throw new Error(
      "Create an Executor profile first."
    );
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error(
      "Invalid latitude or longitude."
    );
  }

  await profile.update({
    // POINT uses [longitude, latitude].
    current_location: {
      type: "Point",
      coordinates: [
        Number(longitude),
        Number(latitude),
      ],
    },
    last_location_at: new Date(),
  });

  return profile;
}