import { acceptTask } from "../services/taskAssignmentService.js";

export async function acceptTaskController(req, res) {
  try {
    const { taskId } = req.params;
    const executorId = req.user.id;

    const assignment = await acceptTask(taskId, executorId);
    res
      .status(200)
      .json({ message: "Task accepted successfully", data: assignment });
  } catch (error) {
    console.error("Accept task error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
