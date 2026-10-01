import {
  changeUserPassword,
  updateNotificationPreferences,
  updateUserProfile,
} from "../services/accountService.js";

export async function updateProfileController(req, res) {
  try {
    const user = await updateUserProfile({
      userId: req.user.id,
      name: req.body.name,
      phone: req.body.phone,
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update profile.",
    });
  }
}

export async function updatePreferencesController(req, res) {
  try {
    const preferences = await updateNotificationPreferences({
      userId: req.user.id,
      preferences: req.body.preferences,
    });

    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully.",
      data: preferences,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to update preferences.",
    });
  }
}

export async function changePasswordController(req, res) {
  try {
    await changeUserPassword({
      userId: req.user.id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to change password.",
    });
  }
}
