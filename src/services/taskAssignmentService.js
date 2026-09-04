import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { createTaskEvent } from "./taskEventService.js";

import {
  Task,
  TaskAssignment,
  User,
  ExecutorProfile,
} from "../models/index.js";

export async function acceptTask(taskId, executorId) {
  const transaction = await sequelize.transaction();
  try {
    const task = await Task.findOne({
      where: {
        id: taskId,
      },
      transaction,
      //   “I'm going to modify this task. Lock its row while this transaction is working.”
      lock: transaction.LOCK.UPDATE,
    });

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.status !== "OPEN") {
      throw new Error("Task is no longer available.");
    }

    const executor = await User.findByPk(executorId, {
      include: [
        {
          model: ExecutorProfile,
          as: "executorProfile",
        },
      ],
      transaction,
    });

    if (!executor) {
      throw new Error("Executor not found.");
    }

    if (executor.account_status !== "ACTIVE") {
      throw new Error("Executor account is not active.");
    }

    if (!executor.executorProfile || !executor.executorProfile.is_available) {
      throw new Error("Executor is not currently available.");
    }

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

    const assignment = await TaskAssignment.create(
      {
        task_id: taskId,
        executor_id: executorId,
        status: "ACTIVE",
      },
      { transaction },
    );

    await createTaskEvent({
      taskId,
      actorUserId: executorId,
      eventType: "TASK_ASSIGNED",
      metadata: {
        assignmentId: assignment.id,
      },
      transaction,
    });

    await task.update(
      {
        status: "ASSIGNED",
      },
      {
        transaction,
      },
    );
    await transaction.commit();
    return assignment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
