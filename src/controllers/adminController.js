import {
  getAdminOverview,
  getAdminUsers,
  updateUserAccountStatus,
} from "../services/adminService.js";

export async function getAdminOverviewController(req, res) {
  try {
    const overview = await getAdminOverview();

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error("Admin overview error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin overview.",
    });
  }
}



export async function getAdminUsersController(req, res) {
  try {
    const data = await getAdminUsers(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin users error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load users.",
    });
  }
}

export async function updateUserStatusController(req, res) {
  try {
    const data = await updateUserAccountStatus({
      userId: req.params.userId,

      accountStatus: req.body.accountStatus,

      adminId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "User account status updated.",
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
