import {
  acceptTask,
  getMyAssignedTasks,
} from "../services/taskAssignmentService.js";
import { releaseTask } from "../services/taskAssignmentService.js";

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

export async function getMyAssignedTasksController(req, res) {
  try {
    const assignments = await getMyAssignedTasks({
      executorId: req.user.id,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,

      data: assignments,
    });
  } catch (error) {
    console.error("Get assigned tasks error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function releaseTaskController(req, res) {
  try {
    const task = await releaseTask({
      taskId: req.params.taskId,
      executorId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Task released successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Release task error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
