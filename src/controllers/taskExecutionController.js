import {
  startTask,
  submitProof,
} from "../services/taskExecutionService.js";

export async function startTaskController(req, res) {
  try {
    const { taskId } = req.params;
    const executorId = req.user.id;

    const task = await startTask(taskId, executorId);

    return res.status(200).json({
      success: true,
      message: "Task started successfully.",
      data: task,
    });
  } catch (error) {
    console.error("Start task error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function submitProofController(req, res) {
  try {
    const { taskId } = req.params;

    const executorId = req.user.id;

    const {
      proofType,
      storageKey,
      textContent,
      metadata,
    } = req.body;

    const proof = await submitProof({
      taskId,
      executorId,
      proofType,
      storageKey,
      textContent,
      metadata,
    });

    return res.status(201).json({
      success: true,
      message: "Proof submitted successfully.",
      data: proof,
    });
  } catch (error) {
    console.error("Submit proof error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}