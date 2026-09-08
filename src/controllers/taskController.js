import {
  createTask,
  getMyTasks,
  getTaskById,
  updateTask,
  cancelTask,
} from "../services/taskService.js";

export async function createTaskController(
  req,
  res
) {
  try {
    const {
      category,
      taskMode,
      title,
      description,
      latitude,
      longitude,
      addressText,
      deadlineAt,
      rewardAmount,
      riskLevel,
      proofType,
    } = req.body;

    const task = await createTask({
      requesterId: req.user.id,
      category,
      taskMode,
      title,
      description,
      latitude,
      longitude,
      addressText,
      deadlineAt,
      rewardAmount,
      riskLevel,
      proofType,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getMyTasksController(
  req,
  res
) {
  try {
    const result = await getMyTasks({
      requesterId: req.user.id,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      category: req.query.category,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get my tasks error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch tasks.",
    });
  }
}

export async function getTaskController(
  req,
  res
) {
  try {
    const task = await getTaskById({
      taskId: req.params.taskId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
}

export async function updateTaskController(
  req,
  res
) {
  try {
    const task = await updateTask({
      taskId: req.params.taskId,
      requesterId: req.user.id,
      updates: req.body,
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function cancelTaskController(
  req,
  res
) {
  try {
    const task = await cancelTask({
      taskId: req.params.taskId,
      requesterId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Task cancelled successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Cancel task error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}