import sequelize from "../config/database.js";
import Task from "../models/task.js";
import { Dispute, TaskAssignment } from "../models/index.js";
import { Op } from "sequelize";
import { releasePaymentForTask } from "./paymentService.js";
import { createTaskEvent } from "./taskEventService.js";

export async function approveTask(taskId, requesterId) {
  const transaction = await sequelize.transaction();
  try {
    const task = await Task.findOne({
      where: {
        id: taskId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!task) {
      throw new Error("Task not found.");
    }

    if (task.requester_id !== requesterId) {
      throw new Error("Only the requester can approve this task.");
    }

    if (task.status !== "PENDING_APPROVAL") {
      throw new Error("Task is not waiting for approval.");
    }

    const assignment = await TaskAssignment.findOne({
      where: {
        task_id: taskId,
        status: "ACTIVE",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!assignment) {
      throw new Error("Active assignment not found.");
    }
    const releasedPayment = await releasePaymentForTask({
      taskId,
      transaction,
    });

    // Move task into its final successful state.
    await task.update(
      {
        status: "COMPLETED",
      },
      {
        transaction,
      },
    );

    await assignment.update(
      {
        status: "COMPLETED",
        completed_at: new Date(),
      },
      {
        transaction,
      },
    );

    await createTaskEvent({
      taskId,
      actorUserId: requesterId,
      eventType: "TASK_APPROVED",
      transaction,
    });

    await transaction.commit();

    return task;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function createDispute({ taskId, userId, reason, description }) {
  const transaction = await sequelize.transaction();
  try {
    const task = await Task.findOne({
      where: {
        id: taskId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!task) {
      throw new Error("Task not found.");
    }
    const isRequester = task.requester_id === userId;

    const assignment = await TaskAssignment.findOne({
      where: {
        task_id: taskId,
        executor_id: userId,
      },
      transaction,
    });

    const isExecutor = Boolean(assignment);

    if (!isRequester && !isExecutor) {
      throw new Error("You are not a participant in this task.");
    }

    if (task.status !== "PENDING_APPROVAL") {
      throw new Error("This task cannot be disputed at its current stage.");
    }

    const existingDispute = await Dispute.findOne({
      where: {
        task_id: taskId,
        status: {
          [Op.in]: ["OPEN", "UNDER_REVIEW"],
        },
      },
      transaction,
    });

    if (existingDispute) {
      throw new Error("An active dispute already exists.");
    }

    const dispute = await Dispute.create(
      {
        task_id: taskId,
        raised_by: userId,
        reason,
        description,
        status: "OPEN",
      },
      {
        transaction,
      },
    );

    await task.update(
      {
        status: "DISPUTED",
      },
      {
        transaction,
      },
    );

    await createTaskEvent({
      taskId,
      actorUserId: userId,
      eventType: "TASK_DISPUTED",
      metadata: {
        disputeId: dispute.id,
      },
      transaction,
    });

    await transaction.commit();

    return dispute;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Start transaction

// Find task and lock it

// Does task exist?
//         ↓
// Is requester actually the owner?
//         ↓
// Is task waiting for approval?
//         ↓
// Find active assignment
//         ↓
// Task → COMPLETED
//         ↓
// Assignment → COMPLETED
//         ↓
// Create TASK_APPROVED event
//         ↓
// COMMIT
