import { getIO } from "./index.js";

export function emitTaskUpdated({
  taskId,
  userIds = [],
  reason,
}) {
  const io = getIO();

  const payload = {
    taskId,
    reason,
    occurredAt: new Date().toISOString(),
  };

  for (const userId of userIds) {
    if (!userId) {
      continue;
    }

    io.to(`user:${userId}`).emit(
      "task:updated",
      payload,
    );
  }
}