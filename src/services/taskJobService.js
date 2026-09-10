import { taskQueue } from "../config/queue.js";

// Schedule automatic expiration for a task.
//
// The job is delayed until the task's deadline.
// BullMQ then sends it to a Worker.
export async function scheduleTaskExpiration({ taskId, deadlineAt }) {
  const deadline = new Date(deadlineAt);

  const delay = deadline.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error("Task deadline must be in the future.");
  }

  const warningDelay = Math.max(
    deadline.getTime() - Date.now() - 60 * 60 * 1000,
    0,
  );

  await taskQueue.add(
    "task-deadline-warning",
    {
      taskId,
    },
    {
      delay: warningDelay,
      jobId: `task-deadline-warning-${taskId}`,
    },
  );

  return taskQueue.add(
    "expire-task",
    {
      taskId,
    },
    {
      delay,

      // Prevent duplicate expiration jobs
      // for the same task.
      jobId: `expire-task-${taskId}`,
    },
  );
}
