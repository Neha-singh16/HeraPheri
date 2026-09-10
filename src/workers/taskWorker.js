import { Worker } from "bullmq";

import { Op } from "sequelize";

import sequelize from "../config/database.js";

import { Task } from "../models/index.js";

import { createTaskEvent } from "../services/taskEventService.js";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

const worker = new Worker(
  "task-jobs",

  async (job) => {
    switch (job.name) {
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

// Automatically expire an OPEN task
// after its deadline.
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
    if (task.status !== "OPEN") {
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

    await createTaskEvent({
      taskId: task.id,

      actorUserId: task.requester_id,

      eventType: "TASK_EXPIRED",

      metadata: {
        deadlineAt: task.deadline_at,
      },

      transaction,
    });

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
