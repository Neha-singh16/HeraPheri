import sequelize from "../config/database.js";
import { Task, TaskAssignment, TaskProof, Payment } from "../models/index.js";
import { createTaskEvent } from "./taskEventService.js";

export async function startTask(taskId, executorId) {
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
      throw new Error("Task cannot be started.");
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
      throw new Error("You are not the assigned Executor for this task.");
    }

    const payment = await Payment.findOne({
      where: {
        task_id: taskId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!payment) {
      throw new Error("Requester has not funded this task yet.");
    }

    if (payment.status !== "HELD") {
      throw new Error(
        "Requester must fund the task before execution can begin.",
      );
    }

    await assignment.update(
      {
        started_at: new Date(),
      },
      {
        transaction,
      },
    );

    await task.update(
      {
        status: "IN_PROGRESS",
      },
      {
        transaction,
      },
    );
    await createTaskEvent({
      taskId,
      actorUserId: executorId,
      eventType: "TASK_STARTED",
      transaction,
    });

    await transaction.commit();

    return task;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function submitProof({
  taskId,
  executorId,
  proofType,
  storageKey = null,
  textContent = null,
  metadata = null,
}) {
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

    if (task.status !== "IN_PROGRESS") {
      throw new Error("Proof can only be submitted for an in-progress task.");
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

    const proof = await TaskProof.create(
      {
        task_id: taskId,
        uploaded_by: executorId,
        proof_type: proofType,
        storage_key: storageKey,
        text_content: textContent,
        metadata,
        review_status: "PENDING",
      },
      {
        transaction,
      },
    );

    await task.update(
      {
        status: "PENDING_APPROVAL",
      },
      {
        transaction,
      },
    );

    await createTaskEvent({
      taskId,
      actorUserId: executorId,
      eventType: "PROOF_SUBMITTED",
      metadata: {
        proofId: proof.id,
      },
      transaction,
    });

    await transaction.commit();

    return proof;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
