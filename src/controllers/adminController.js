import {
  getAdminOverview,
  getAdminUsers,
  updateUserAccountStatus,
  getPendingVerifications,
  getAdminTasks,
  getAdminPayments,
  getAdminAuditLogs,
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

export async function getPendingVerificationsController(req, res) {
  try {
    const verifications = await getPendingVerifications();

    return res.status(200).json({
      success: true,
      data: verifications,
    });
  } catch (error) {
    console.error("Pending verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load verification queue.",
    });
  }
}

export async function getAdminTasksController(req, res) {
  try {
    const data = await getAdminTasks(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load admin tasks.",
    });
  }
}

export async function getAdminPaymentsController(req, res) {
  try {
    const data = await getAdminPayments(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load payments.",
    });
  }
}

export async function getAdminAuditController(req, res) {
  try {
    const data = await getAdminAuditLogs(req.query);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Admin audit error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load audit logs.",
    });
  }
}
