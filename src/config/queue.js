
import {
  Queue,
} from "bullmq";

const redisUrl =
  process.env.REDIS_URL ||
  "redis://localhost:6379";

// BullMQ queue for asynchronous task jobs.
export const taskQueue =
  new Queue("task-jobs", {
    connection: {
      url: redisUrl,
    },

    defaultJobOptions: {
      attempts: 3,

      backoff: {
        type: "exponential",
        delay: 5000,
      },

      removeOnComplete: 100,
      removeOnFail: 500,
    },
  });

export async function closeTaskQueue() {
  await taskQueue.close();
}

