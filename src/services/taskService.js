import { Op } from "sequelize";
import sequelize from "../config/database.js";

import { Task } from "../models/index.js";

import { createTaskEvent } from "./taskEventService.js";
import { scheduleTaskExpiration } from "./taskJobService.js";

const VALID_CATEGORIES = ["GO", "GET", "CHECK", "DIGITAL"];
const VALID_MODES = ["PHYSICAL", "DIGITAL", "HYBRID"];

export async function createTask({
  requesterId,
  category,
  taskMode,
  title,
  description,
  latitude,
  longitude,
  addressText,
  deadlineAt,
  rewardAmount,
  riskLevel = "LOW",
  proofType = "TEXT_RESULT",
}) {
  if (!VALID_CATEGORIES.includes(category)) {
    throw new Error("Invalid task category.");
  }
  if (!VALID_MODES.includes(taskMode)) {
    throw new Error("Invalid task mode.");
  }
  // V1 does not allow high-risk tasks.
  if (riskLevel === "HIGH") {
    throw new Error("High-risk tasks are not supported in V1.");
  }

  if (!title?.trim()) {
    throw new Error("Task title is required.");
  }

  if (!description?.trim()) {
    throw new Error("Task description is required.");
  }

  const deadline = new Date(deadlineAt);

  if (Number.isNaN(deadline.getTime())) {
    throw new Error("Invalid deadline.");
  }

  if (deadline <= new Date()) {
    throw new Error("Deadline must be in the future.");
  }

  const reward = Number(rewardAmount);

  if (!Number.isFinite(reward) || reward <= 0) {
    throw new Error("Reward amount must be greater than zero.");
  }

  // Physical and hybrid tasks need a location.
  if (
    (taskMode === "PHYSICAL" || taskMode === "HYBRID") &&
    (latitude == null || longitude == null)
  ) {
    throw new Error("Location is required for physical tasks.");
  }

  // Latitude/longitude must be valid coordinates.
  if (latitude != null && longitude != null) {
    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error("Invalid coordinates.");
    }
  }
  const transaction = await sequelize.transaction();
  try {
    const task = await Task.create(
      {
        requester_id: requesterId,
        category,
        task_mode: taskMode,
        title: taskMode,
        title: title.trim(),
        description: description.trim(),
        // Sequelize accepts a GeoJSON Point for the POINT column.
        location:
          latitude != null && longitude != null
            ? {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
              }
            : null,

        address_text: addressText?.trim() || null,
        deadline_at: deadline,
        reward_amount: reward,
        currency: "INR",
        risk_level: riskLevel,
        proof_type: proofType,
        status: "OPEN",
      },
      {
        transaction,
      },
    );

    // Record the creation in the task audit history.
    await createTaskEvent({
      taskId: task.id,
      actorUserId: requesterId,
      eventType: "TASK_CREATED",
      transaction,
    });

    await transaction.commit();
    try {
      await scheduleTaskExpiration({
        taskId: task.id,
        deadlineAt: task.deadline_at,
      });
    } catch (jobError) {
      /*
    The task is already committed.

    Queue failure should be logged and handled
    separately rather than pretending the task
    creation itself failed.
  */
      console.error("Failed to schedule task expiration:", jobError);
    }

    return task;

    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Get tasks created by the logged-in user.
export async function getMyTasks({
  requesterId,
  page = 1,
  limit = 10,
  status,
  category,
}) {
  const safePage = Math.max((Number(page) || 1, 1));
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const offset = (safePage - 1) * safeLimit;

  const where = {
    requester_id: requesterId,
  };
  if (status) {
    where.status = status;
  }

  if (category) {
    where.category = category;
  }

  const result = await Task.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit: safeLimit,
    offset,
  });

  return {
    tasks: result.rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total: result.count,
      totalPages: Math.ceil(result.count / safeLimit),
    },
  };
}

// Get one task.
export async function getTaskById({ taskId, userId }) {
  const task = await Task.findByPk(taskId);

  if (!task) {
    throw new Error("Task not found.");
  }

  // For V1, task details are visible to authenticated users.
  // Sensitive information will be restricted later.
  return task;
}

export async function updateTask({ taskId, requesterId, updates }) {
  const transaction = await sequelize.transaction();
  try {
    const task = await Task.findOne({
      where: {
        id: taskId,
        requester_id: requesterId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!task) {
      throw new Error("Task not found or access denied.");
    }

    // Once someone has accepted the task,
    // requester cannot freely change important details.
    if (task.status !== "OPEN") {
      throw new Error("Only open tasks can be edited.");
    }

    const updateFieldMap = {
      category: "category",
      taskMode: "task_mode",
      title: "title",
      description: "description",
      addressText: "address_text",
      deadlineAt: "deadline_at",
      rewardAmount: "reward_amount",
      riskLevel: "risk_level",
      proofType: "proof_type",
    };
    const safeUpdates = {};

    for (const [requestField, modelField] of Object.entries(updateFieldMap)) {
      if (updates[requestField] !== undefined) {
        safeUpdates[modelField] = updates[requestField];
      }
    }

    // Handle location separately because it is a POINT.
    if (updates.latitude !== undefined || updates.longitude !== undefined) {
      if (updates.latitude == null || updates.longitude == null) {
        safeUpdates.location = null;
      } else {
        safeUpdates.location = {
          type: "Point",
          coordinates: [Number(updates.longitude), Number(updates.latitude)],
        };
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      throw new Error("At least one valid task field is required.");
    }

    if (safeUpdates.deadline_at !== undefined) {
      const deadline = new Date(safeUpdates.deadline_at);

      if (Number.isNaN(deadline.getTime()) || deadline <= new Date()) {
        throw new Error("Deadline must be in the future.");
      }
    }

    if (safeUpdates.reward_amount !== undefined) {
      const reward = Number(safeUpdates.reward_amount);

      if (!Number.isFinite(reward) || reward <= 0) {
        throw new Error("Reward must be greater than zero.");
      }
    }

    if (safeUpdates.risk_level === "HIGH") {
      throw new Error("High-risk tasks are not supported in V1.");
    }

    await task.update(safeUpdates, {
      transaction,
    });

    await createTaskEvent({
      taskId: task.id,
      actorUserId: requesterId,
      eventType: "TASK_UPDATED",
      metadata: {
        fields: Object.keys(safeUpdates),
      },
      transaction,
    });

    await transaction.commit();

    return task;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Cancel an open task.
export async function cancelTask({ taskId, requesterId }) {
  const transaction = await sequelize.transaction();

  try {
    const task = await Task.findOne({
      where: {
        id: taskId,
        requester_id: requesterId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!task) {
      throw new Error("Task not found or access denied.");
    }

    if (!["OPEN"].includes(task.status)) {
      throw new Error("Only open tasks can be cancelled in V1.");
    }

    await task.update(
      {
        status: "CANCELLED",
      },
      {
        transaction,
      },
    );

    await createTaskEvent({
      taskId: task.id,
      actorUserId: requesterId,
      eventType: "TASK_CANCELLED",
      metadata: {
        reason: "Requester cancelled",
      },
      transaction,
    });

    await transaction.commit();

    return task;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
