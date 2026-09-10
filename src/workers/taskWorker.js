import { Worker } from "bullmq";

import sequelize from "../config/database.js";

import {
  Task,
  TaskAssignment,
} from "../models/index.js";

import { createTaskEvent } from "../services/taskEventService.js";
import { createNotification } from "../services/notificationService.js";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const worker = new Worker(
  "task-jobs",

  async (job) => {
    switch (job.name) {
      case "task-deadline-warning":
        return notifyDeadlineNear(job.data.taskId);

      case "expire-task":
        return expireTask(job.data.taskId);

      default:
        throw new Error(`Unknown task job: ${job.name}`);
    }
  },

  {
    connection: {
      url: redisUrl,
    },

    concurrency: 5,
  },
);

async function notifyDeadlineNear(taskId) {
  const task = await Task.findByPk(taskId);

  if (!task || !["OPEN", "ASSIGNED", "IN_PROGRESS"].includes(task.status)) {
    return { skipped: true, reason: "Task is no longer active." };
  }

  const assignment = await TaskAssignment.findOne({
    where: {
      task_id: taskId,
      status: "ACTIVE",
    },
  });

  if (!assignment) {
    return { skipped: true, reason: "Task has no active Executor." };
  }

  await createNotification({
    userId: assignment.executor_id,
    type: "TASK_DEADLINE_NEAR",
    title: "Task deadline is near",
    message: `The deadline for "${task.title}" is within one hour.`,
    data: {
      taskId: task.id,
      deadlineAt: task.deadline_at,
    },
  });

  return { success: true, taskId };
}

// Automatically expire an active task after its deadline.
async function expireTask(taskId) {
  const transaction = await sequelize.transaction();

  try {
    const task = await Task.findOne({
      where: {
        id: taskId,
      },

      transaction,

      lock: transaction.LOCK.UPDATE,
    });

    // Task may have been deleted or
    // the job may be stale.
    if (!task) {
      await transaction.commit();

      return {
        skipped: true,
        reason: "Task not found.",
      };
    }

    /*
      Only OPEN tasks should expire.

      If an Executor already accepted it,
      the job must not overwrite ASSIGNED.
    */
    if (
      !["OPEN", "ASSIGNED", "IN_PROGRESS", "PENDING_APPROVAL"].includes(
        task.status,
      )
    ) {
      await transaction.commit();

      return {
        skipped: true,

        reason: `Task is already ${task.status}.`,
      };
    }

    await task.update(
      {
        status: "EXPIRED",
      },

      {
        transaction,
      },
    );

    const assignment = await TaskAssignment.findOne({
      where: {
        task_id: task.id,
        status: "ACTIVE",
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (assignment) {
      await assignment.update(
        {
          status: "CANCELLED",
          released_at: new Date(),
        },
        { transaction },
      );
    }

    await createTaskEvent({
      taskId: task.id,

      actorUserId: task.requester_id,

      eventType: "TASK_EXPIRED",

      metadata: {
        deadlineAt: task.deadline_at,
      },

      transaction,
    });

    await createNotification({
      userId: task.requester_id,
      type: "TASK_EXPIRED",
      title: "Task expired",
      message: `Your task "${task.title}" expired at its deadline.`,
      data: {
        taskId: task.id,
        deadlineAt: task.deadline_at,
      },
      transaction,
    });

    if (assignment) {
      await createNotification({
        userId: assignment.executor_id,
        type: "TASK_EXPIRED",
        title: "Assigned task expired",
        message: `The deadline for "${task.title}" has passed, so the task expired.`,
        data: {
          taskId: task.id,
          deadlineAt: task.deadline_at,
        },
        transaction,
      });
    }

    await transaction.commit();

    console.log(`⏰ Task expired: ${task.id}`);

    return {
      success: true,
      taskId: task.id,
      status: "EXPIRED",
    };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}

worker.on("completed", (job) => {
  console.log(`✅ Task job completed: ${job.id} (${job.name})`);
});

worker.on("failed", (job, error) => {
  console.error(`❌ Task job failed: ${job?.id}`, error);
});

worker.on("stalled", (jobId) => {
  console.error(`⚠️ Task job stalled: ${jobId}`);
});

worker.on("error", (error) => {
  console.error("❌ Task worker error:", error);
});

console.log("👷 Task worker started.");
