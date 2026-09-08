import {
  createExecutorProfile,
  getExecutorProfile,
  updateAvailability,
  updateLocation,
} from "../services/executorProfileService.js";

export async function createExecutorProfileController(
  req,
  res
) {
  try {
    const profile =
      await createExecutorProfile({
        userId: req.user.id,
        bio: req.body.bio,
      });

    return res.status(201).json({
      success: true,
      message:
        "Executor profile created successfully.",
      data: profile,
    });
  } catch (error) {
    console.error(
      "Create Executor profile error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getExecutorProfileController(
  req,
  res
) {
  try {
    const profile =
      await getExecutorProfile(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateAvailabilityController(
  req,
  res
) {
  try {
    const { isAvailable } = req.body;

    if (
      typeof isAvailable !== "boolean"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "isAvailable must be a boolean.",
      });
    }

    const profile =
      await updateAvailability({
        userId: req.user.id,
        isAvailable,
      });

    return res.status(200).json({
      success: true,
      message:
        "Availability updated successfully.",
      data: profile,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateLocationController(
  req,
  res
) {
  try {
    const {
      latitude,
      longitude,
    } = req.body;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude must be numbers.",
      });
    }

    const profile =
      await updateLocation({
        userId: req.user.id,
        latitude,
        longitude,
      });

    return res.status(200).json({
      success: true,
      message:
        "Location updated successfully.",
      data: profile,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}