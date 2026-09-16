import { Worker } from "bullmq";

import sequelize from "../config/database.js";

import { Task, TaskAssignment } from "../models/index.js";

import { createTaskEvent } from "../services/taskEventService.js";
import { createNotification } from "../services/notificationService.js";
import { emitTaskUpdated } from "../socket/taskEvents.js";
import { emitNotificationToUser } from "../socket/index.js";
import { processRefundForTask } from "../services/paymentService.js";

import {
  createTaskNotifications,
  emitTaskNotifications,
} from "../services/taskNotificationService.js";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const worker = new Worker(
  "task-jobs",

  async (job) => {
    switch (job.name) {
      case "task-deadline-warning":
        return notifyDeadlineNear(job.data.taskId);

      case "expire-task":
        return expireTask(job.data.taskId);

      case "refund-payment":
        return processRefundForTask({
          taskId: job.data.taskId,
          reason: job.data.reason,
        });

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

  if (!task) {
    return {
      skipped: true,
      reason: "Task not found.",
    };
  }

  /*
    OPEN:
    only requester needs a warning because there
    is no Executor yet.
  */
  if (task.status === "OPEN") {
    const notifications = await createTaskNotifications({
      taskId: task.id,

      userIds: [task.requester_id],

      type: "TASK_DEADLINE_NEAR",

      title: "Task deadline is near",

      message: `Your task "${task.title}" is due within one hour.`,

      data: {
        deadlineAt: task.deadline_at,
      },
    });

    emitTaskNotifications(notifications);

    emitTaskUpdated({
      taskId: task.id,

      userIds: [task.requester_id],

      reason: "TASK_DEADLINE_NEAR",
    });

    return {
      success: true,
      taskId: task.id,
      notified: "REQUESTER",
    };
  }

  /*
    ASSIGNED / IN_PROGRESS:
    notify both participants.
  */
  if (task.status !== "ASSIGNED" && task.status !== "IN_PROGRESS") {
    return {
      skipped: true,

      reason: `Task is ${task.status}; no deadline warning needed.`,
    };
  }

  const assignment = await TaskAssignment.findOne({
    where: {
      task_id: taskId,

      status: "ACTIVE",
    },
  });

  if (!assignment) {
    return {
      skipped: true,

      reason: "Task has no active Executor.",
    };
  }

  const participantIds = [task.requester_id, assignment.executor_id];

  const notifications = await createTaskNotifications({
    taskId: task.id,

    userIds: participantIds,

    type: "TASK_DEADLINE_NEAR",

    title: "Task deadline is near",

    message: `The deadline for "${task.title}" is within one hour.`,

    data: {
      deadlineAt: task.deadline_at,
    },
  });

  emitTaskNotifications(notifications);

  emitTaskUpdated({
    taskId: task.id,

    userIds: participantIds,

    reason: "TASK_DEADLINE_NEAR",
  });

  return {
    success: true,

    taskId: task.id,

    notified: participantIds,
  };
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
      OPEN tasks genuinely expire.
    */
    if (task.status === "OPEN") {
      await task.update(
        {
          status: "EXPIRED",
        },
        {
          transaction,
        },
      );

      await createTaskEvent({
        taskId: task.id,
        actorUserId: task.requester_id,
        eventType: "TASK_EXPIRED",
        metadata: {
          deadlineAt: task.deadline_at,
        },
        transaction,
      });

      const notification = await createNotification({
        userId: task.requester_id,
        type: "TASK_EXPIRED",
        title: "Task expired",
        message: `Your task "${task.title}" expired because the deadline passed.`,
        data: {
          taskId: task.id,
          deadlineAt: task.deadline_at,
        },
        transaction,
      });

      await transaction.commit();

      emitTaskUpdated({
        taskId: task.id,
        userIds: [task.requester_id],
        reason: "TASK_EXPIRED",
      });

      try {
        emitNotificationToUser(task.requester_id, notification);
      } catch (socketError) {
        console.error("Realtime notification failed:", socketError.message);
      }

      console.log(`⏰ Task expired: ${task.id}`);

      return {
        success: true,
        taskId: task.id,
        status: "EXPIRED",
      };
    }

    /*
      Assigned / in-progress tasks should not be automatically killed.
    */
    if (task.status === "ASSIGNED" || task.status === "IN_PROGRESS") {
      const assignment = await TaskAssignment.findOne({
        where: {
          task_id: task.id,
          status: "ACTIVE",
        },
        transaction,
      });

      if (assignment) {
        const participantIds = [task.requester_id, assignment.executor_id];

        const notifications = await createTaskNotifications({
          taskId: task.id,
          userIds: participantIds,
          type: "TASK_DEADLINE_PASSED",
          title: "Task deadline passed",
          message: `The deadline for "${task.title}" has passed while the task is still active.`,
          data: {
            deadlineAt: task.deadline_at,
          },
          transaction,
        });

        await transaction.commit();

        emitTaskUpdated({
          taskId: task.id,
          userIds: participantIds,
          reason: "TASK_DEADLINE_PASSED",
        });

        emitTaskNotifications(notifications);

        return {
          success: true,
          taskId: task.id,
          status: task.status,
          overdue: true,
        };
      }
    }

    await transaction.commit();

    return {
      skipped: true,
      reason: `Task is ${task.status}; no deadline action required.`,
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
  console.error("❌ Task job failed", {
    id: job?.id,
    name: job?.name,
    taskId: job?.data?.taskId,
    paymentId: job?.data?.paymentId,
    attemptsMade: job?.attemptsMade,
    error: error.message,
  });
});

worker.on("stalled", (jobId) => {
  console.error(`⚠️ Task job stalled: ${jobId}`);
});

worker.on("error", (error) => {
  console.error("❌ Task worker error:", error);
});

console.log("👷 Task worker started.");
