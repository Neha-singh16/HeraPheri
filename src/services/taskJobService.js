import { taskQueue } from "../config/queue.js";

const DEADLINE_WARNING_MS = 60 * 60 * 1000;

/*
  Remove previously scheduled deadline jobs for a task.

  This is important when the requester edits the deadline.
*/
async function removeTaskDeadlineJobs(taskId) {
  const jobIds = [`task-deadline-warning-${taskId}`, `expire-task-${taskId}`];

  for (const jobId of jobIds) {
    const job = await taskQueue.getJob(jobId);

    if (job) {
      await job.remove();
    }
  }
}

/*
  Schedule both:
  1. one-hour warning
  2. deadline expiration/check
*/
export async function scheduleTaskExpiration({ taskId, deadlineAt }) {
  const deadline = new Date(deadlineAt);

  const delay = deadline.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error("Task deadline must be in the future.");
  }

  /*
    Remove stale jobs first.

    This makes deadline editing safe.
  */
  await removeTaskDeadlineJobs(taskId);

  const warningDelay = Math.max(delay - DEADLINE_WARNING_MS, 0);

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
      jobId: `expire-task-${taskId}`,
    },
  );
}

/*
  If an Executor accepts a task after the one-hour
  warning time has already passed, create an immediate
  warning job for that assignment.

  Example:
  deadline = 60 minutes away
  Executor accepts now
  → warning should happen now.
*/
export async function scheduleDeadlineWarningForAssignment({
  taskId,
  assignmentId,
  deadlineAt,
}) {
  const deadline = new Date(deadlineAt);

  const warningTime = deadline.getTime() - DEADLINE_WARNING_MS;

  const delay = warningTime - Date.now();

  /*
    The original task warning job will still handle
    warnings when more than one hour remains.

    We only need this extra job if the warning point
    has already passed.
  */
  if (delay > 0) {
    return null;
  }

  return taskQueue.add(
    "task-deadline-warning",
    {
      taskId,
      assignmentId,
      lateAssignment: true,
    },
    {
      delay: 0,
      jobId: `task-deadline-warning-assignment-${assignmentId}`,
    },
  );
}

/*
  Refund job scheduling.
*/
export function schedulePaymentRefund({ paymentId, taskId, reason }) {
  return taskQueue.add(
    "refund-payment",
    {
      paymentId,
      taskId,
      reason,
    },
    {
      jobId: `refund-payment-${paymentId}`,
    },
  );
}
