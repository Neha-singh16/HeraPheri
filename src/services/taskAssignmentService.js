import sequelize from "../config/database.js";
import { createNotification } from "./notificationService.js";
import { emitNotificationToUser } from "../socket/index.js";
import { emitTaskUpdated } from "../socket/taskEvents.js";
import { Payment } from "../models/index.js";

import {
  Task,
  TaskAssignment,
  User,
  ExecutorProfile,
  Verification,
} from "../models/index.js";

import { createTaskEvent } from "./taskEventService.js";

const MAX_ACTIVE_TASKS = 3;
const LOCATION_FRESHNESS_MINUTES = 30;

// Accept a task safely and atomically.
export async function acceptTask(taskId, executorId) {
  const transaction = await sequelize.transaction();

  try {
    // ---------------------------------------------------
    // 1. Lock the task.
    // This prevents two Executors from claiming it
    // at the same time.
    // ---------------------------------------------------
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

    // Task must still be available.
    if (task.status !== "OPEN") {
      throw new Error("Task is no longer available.");
    }

    // Requester cannot execute their own task.
    if (task.requester_id === executorId) {
      throw new Error("You cannot accept your own task.");
    }

    // V1 does not automatically assign HIGH-risk work.
    if (task.risk_level === "HIGH") {
      throw new Error(
        "HIGH-risk tasks cannot be accepted through V1 matching.",
      );
    }

    // ---------------------------------------------------
    // 2. Lock the Executor profile too.
    //
    // Why?
    //
    // Imagine Executor A accepts:
    // Task 1
    // Task 2
    // Task 3
    // Task 4
    //
    // simultaneously.
    //
    // Locking the Executor profile makes the active-task
    // capacity check serial for that Executor.
    // ---------------------------------------------------

    const executorProfile = await ExecutorProfile.findOne({
      where: {
        user_id: executorId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!executorProfile) {
      throw new Error("Create an Executor profile first.");
    }

    if (!executorProfile.is_available) {
      throw new Error("Executor is not currently available.");
    }

    // ---------------------------------------------------
    // 3. Fetch and validate the user.
    // ---------------------------------------------------
    const executor = await User.findByPk(executorId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!executor) {
      throw new Error("Executor not found.");
    }

    if (executor.account_status !== "ACTIVE") {
      throw new Error("Executor account is not active.");
    }
    // ---------------------------------------------------
    // Verify Executor identity status.
    //
    // IMPORTANT:
    // We check this again during ACCEPT.
    // Matching recommendations are not trusted blindly.
    // ---------------------------------------------------
    const verification = await Verification.findOne({
      where: {
        user_id: executorId,
        verification_type: "IDENTITY",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // Medium-risk tasks require verified identity.
    if (task.risk_level === "MEDIUM" && verification?.status !== "VERIFIED") {
      throw new Error(
        "Identity verification is required for medium-risk tasks.",
      );
    }

    // ---------------------------------------------------
    // 4. Check current workload.
    // ---------------------------------------------------
    const activeTaskCount = await TaskAssignment.count({
      where: {
        executor_id: executorId,
        status: "ACTIVE",
      },
      transaction,
    });

    if (activeTaskCount >= MAX_ACTIVE_TASKS) {
      throw new Error("Executor has reached the maximum active task limit.");
    }

    // ---------------------------------------------------
    // 5. Medium-risk tasks need stronger reliability.
    // These rules mirror the Matching Engine.
    // ---------------------------------------------------
    if (task.risk_level === "MEDIUM") {
      if (Number(executorProfile.trust_score) < 60) {
        throw new Error("Executor trust score is too low for this task.");
      }

      if (Number(executorProfile.completion_rate) < 80) {
        throw new Error("Executor completion rate is too low for this task.");
      }

      if (Number(executorProfile.on_time_rate) < 80) {
        throw new Error("Executor on-time rate is too low for this task.");
      }
    }

    // ---------------------------------------------------
    // 6. Physical / Hybrid tasks need a fresh location.
    //
    // We don't force a distance check here because the
    // candidate search radius can be chosen by the client.
    //
    // What we DO enforce:
    // - location exists
    // - location is recent
    // ---------------------------------------------------
    if (task.task_mode === "PHYSICAL" || task.task_mode === "HYBRID") {
      if (!executorProfile.current_location) {
        throw new Error("A current location is required for this task.");
      }

      if (!executorProfile.last_location_at) {
        throw new Error("Executor location is outdated.");
      }

      const locationAge =
        Date.now() - new Date(executorProfile.last_location_at).getTime();

      const maxLocationAge = LOCATION_FRESHNESS_MINUTES * 60 * 1000;

      if (locationAge > maxLocationAge) {
        throw new Error(
          "Executor location is too old. Please update your location.",
        );
      }
    }

    // ---------------------------------------------------
    // 7. Final protection against an existing assignment.
    // ---------------------------------------------------
    const existingAssignment = await TaskAssignment.findOne({
      where: {
        task_id: taskId,
        status: "ACTIVE",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (existingAssignment) {
      throw new Error("Task has already been assigned.");
    }

    // ---------------------------------------------------
    // 8. Create assignment.
    // ---------------------------------------------------
    const assignment = await TaskAssignment.create(
      {
        task_id: taskId,
        executor_id: executorId,
        status: "ACTIVE",
      },
      {
        transaction,
      },
    );

    // ---------------------------------------------------
    // 9. Update task state.
    // ---------------------------------------------------
    await task.update(
      {
        status: "ASSIGNED",
      },
      {
        transaction,
      },
    );

    // ---------------------------------------------------
    // 10. Create audit event.
    // ---------------------------------------------------
    await createTaskEvent({
      taskId,
      actorUserId: executorId,
      eventType: "TASK_ASSIGNED",
      metadata: {
        assignmentId: assignment.id,
        executorId,
      },
      transaction,
    });

    const notification = await createNotification({
      userId: task.requester_id,

      type: "TASK_ASSIGNED",

      title: "Task accepted",

      message: "Your task has been accepted by an Executor.",

      data: {
        taskId: task.id,
        assignmentId: assignment.id,
        executorId,
      },

      transaction,
    });

    await transaction.commit();

    // -----------------------------------------------
    // IMPORTANT:
    // Emit only AFTER the DB transaction succeeds.
    // -----------------------------------------------

    emitTaskUpdated({
      taskId,
      userIds: [task.requester_id, executorId],
      reason: "TASK_ASSIGNED",
    });
    try {
      emitNotificationToUser(task.requester_id, notification);
    } catch (socketError) {
      /*
    Socket failure must not make a successful
    database transaction look like a failure.

    The notification is already persisted in MySQL,
    so the client can fetch it later through:

    GET /api/v1/notifications
  */
      console.error("Realtime notification failed:", socketError.message);
    }

    return assignment;
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}

export async function getMyAssignedTasks({ executorId, status }) {
  const where = {
    executor_id: executorId,
  };

  // Allow optional status filtering.
  if (status) {
    where.status = status;
  }

  const assignments = await TaskAssignment.findAll({
    where,

    include: [
      {
        model: Task,
        as: "task",
      },
    ],

    order: [["created_at", "DESC"]],
  });

  return assignments;
}

// If an Executor accepts something and decides:
// "I can't do this."
// they need a controlled way to release it.
export async function releaseTask({ taskId, executorId }) {
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

    if (task.status !== "ASSIGNED") {
      throw new Error("Only assigned tasks can be released.");
    }

    const assignment = await TaskAssignment.findOne({
      where: {
        task_id: taskId,
        executor_id: executorId,
        status: "ACTIVE",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!assignment) {
      throw new Error("You are not the assigned Executor.");
    }

    const payment = await Payment.findOne({
      where: {
        task_id: taskId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    /*
      Do NOT allow release once requester has funded.
      Money has entered the financial lifecycle.
    */
    if (payment && ["HELD", "RELEASED"].includes(payment.status)) {
      throw new Error("A funded task cannot be released by the Executor.");
    }

    await assignment.update(
      {
        status: "RELEASED",
        released_at: new Date(),
      },
      { transaction },
    );

    await task.update(
      {
        status: "OPEN",
      },
      { transaction },
    );

    await createTaskEvent({
      taskId,
      actorUserId: executorId,
      eventType: "TASK_RELEASED",
      metadata: {
        assignmentId: assignment.id,
      },
      transaction,
    });

    await transaction.commit();

    emitTaskUpdated({
      taskId,
      userIds: [task.requester_id, executorId],
      reason: "TASK_RELEASED",
    });

    return task;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
