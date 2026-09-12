import {
  getAdminDispute,
  listAdminDisputes,
  resolveAdminDispute,
} from "../services/adminDisputeService.js";

export async function listAdminDisputesController(req, res) {
  try {
    const disputes = await listAdminDisputes({ status: req.query.status });

    return res.status(200).json({ success: true, data: disputes });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

export async function getAdminDisputeController(req, res) {
  try {
    const dispute = await getAdminDispute(req.params.disputeId);

    return res.status(200).json({ success: true, data: dispute });
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
}

export async function resolveAdminDisputeController(req, res) {
  try {
    const dispute = await resolveAdminDispute({
      disputeId: req.params.disputeId,
      adminId: req.user.id,
      resolution: req.body.resolution,
      resolutionNote: req.body.resolutionNote,
    });

    return res.status(200).json({
      success: true,
      message: "Dispute resolved successfully.",
      data: dispute,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}