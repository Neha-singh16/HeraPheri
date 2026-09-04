import { TaskEvent } from "../models/index.js";

export async function createTaskEvent({
  taskId,
  actorUserId = null,
  eventType,
  metadata = null,
  transaction,
}) {
  return TaskEvent.create(
    {
      task_id: taskId,
      actor_user_id: actorUserId,
      event_type: eventType,
      metadata,
    },
    {
      transaction,
    },
  );
}
