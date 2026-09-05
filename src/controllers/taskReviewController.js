import {
  approveTask,
  createDispute,
} from "../services/taskReviewService.js";

export async function approveTaskController(req, res) {
  try {
    const { taskId } = req.params;
    const requesterId = req.user.id;

    const task = await approveTask(
      taskId,
      requesterId
    );

    return res.status(200).json({
      success: true,
      message: "Task approved successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Approve task error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}


export async function createDisputeController(req, res) {
  try {
    const { taskId } = req.params;

    const userId = req.user.id;

    const {
      reason,
      description,
    } = req.body;

    if (!reason || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Reason and description are required.",
      });
    }

    const dispute = await createDispute({
      taskId,
      userId,
      reason,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Dispute created successfully.",
      data: dispute,
    });
  } catch (error) {
    console.error("Create dispute error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}