import {
  getOrCreateVerification,
  startVerification,
  approveVerification,
  rejectVerification,
} from "../services/verificationService.js";
import { recalculateTrustScore,getTrustProfile } from "../services/trustService.js";


// USER
export async function getMyVerificationController(req, res) {
  try {
    const verification = await getOrCreateVerification(req.user.id);

    return res.status(200).json({
      success: true,

      data: {
        status: verification.status,

        verificationType: verification.verification_type,

        verifiedAt: verification.verified_at,

        rejectionReason: verification.rejection_reason,
      },
    });
  } catch (error) {
    console.error("Get verification error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function startVerificationController(req, res) {
  try {
    const verification = await startVerification(req.user.id);

    return res.status(200).json({
      success: true,

      message: "Verification started successfully.",

      data: {
        status: verification.status,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// ---------------------------------------------
// ADMIN
// ---------------------------------------------

export async function approveVerificationController(req, res) {
  try {
    const verification = await approveVerification({
      userId: req.params.userId,

      provider: req.body.provider || "MANUAL",
    });

    await recalculateTrustScore(req.params.userId);
    return res.status(200).json({
      success: true,

      message: "User identity verified successfully.",

      data: verification,
    });
  } catch (error) {
    console.error("Approve verification error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function rejectVerificationController(req, res) {
  try {
    const verification = await rejectVerification({
      userId: req.params.userId,

      reason: req.body.reason,

      provider: req.body.provider || "MANUAL",
    });

    return res.status(200).json({
      success: true,

      message: "User verification rejected.",

      data: verification,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}



export async function getMyTrustController(
  req,
  res
) {
  try {
    const profile =
      await getTrustProfile(
        req.user.id
      );

    return res.status(200).json({
      success: true,

      data: {
        trustScore:
          Number(
            profile.trust_score
          ),

        completionRate:
          Number(
            profile.completion_rate
          ),

        onTimeRate:
          Number(
            profile.on_time_rate
          ),

        completedTasks:
          profile.completed_tasks,

        totalTasks:
          profile.total_tasks,
      },
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}