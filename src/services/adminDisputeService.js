import { Op } from "sequelize";

import sequelize from "../config/database.js";
import {
  Dispute,
  Payment,
  Task,
  TaskAssignment,
  TaskProof,
  User,
} from "../models/index.js";
import { createTaskEvent } from "./taskEventService.js";
import {
  createTaskNotifications,
  emitTaskNotifications,
} from "./taskNotificationService.js";
import { emitTaskUpdated } from "../socket/taskEvents.js";
import {
  releasePaymentForTask,
  requestRefundForTask,
} from "./paymentService.js";
import { schedulePaymentRefund } from "./taskJobService.js";

const disputeIncludes = [
  {
    model: Task,
    as: "task",
    include: [
      { model: User, as: "requester", attributes: ["id", "name", "email"] },
      { model: TaskAssignment, as: "assignments" },
      { model: TaskProof, as: "proofs" },
      { model: Payment, as: "payment" },
    ],
  },
  { model: User, as: "raiser", attributes: ["id", "name", "email"] },
  { model: User, as: "resolver", attributes: ["id", "name", "email"] },
];

export async function listAdminDisputes({ status }) {
  const where = status
    ? { status }
    : { status: { [Op.in]: ["OPEN", "UNDER_REVIEW"] } };

  return Dispute.findAll({
    where,
    include: disputeIncludes,
    order: [["created_at", "ASC"]],
  });
}

export async function getAdminDispute(disputeId) {
  const dispute = await Dispute.findByPk(disputeId, {
    include: disputeIncludes,
  });

  if (!dispute) {
    throw new Error("Dispute not found.");
  }

  return dispute;
}

export async function resolveAdminDispute({
  disputeId,
  adminId,
  resolution,
  resolutionNote = null,
}) {
  const transaction = await sequelize.transaction();
  let refundRequest = null;

  try {
    const dispute = await Dispute.findByPk(disputeId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!dispute) {
      throw new Error("Dispute not found.");
    }

    if (dispute.status === "RESOLVED" || dispute.status === "REJECTED") {
      await transaction.commit();
      return dispute;
    }

    if (!["REFUND_REQUESTER", "RELEASE_EXECUTOR"].includes(resolution)) {
      throw new Error(
        "Resolution must refund the requester or release the Executor.",
      );
    }

    const task = await Task.findByPk(dispute.task_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!task || task.status !== "DISPUTED") {
      throw new Error("Only disputed tasks can be resolved.");
    }

    const assignment = await TaskAssignment.findOne({
      where: { task_id: task.id, status: "ACTIVE" },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const payment = await Payment.findOne({
      where: { task_id: task.id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!assignment || !payment) {
      throw new Error(
        "The disputed task is missing its assignment or payment.",
      );
    }

    if (resolution === "REFUND_REQUESTER") {
      if (payment.status === "HELD") {
        refundRequest = await requestRefundForTask({
          taskId: task.id,
          transaction,
        });
      } else if (
        !["REFUND_REQUESTED", "REFUNDED"].includes(payment.status)
      ) {
        throw new Error("Only held payments can be refunded.");
      }

      await task.update({ status: "CANCELLED" }, { transaction });
      await assignment.update({ status: "CANCELLED" }, { transaction });

    } else {
      if (payment.status === "HELD") {
        await releasePaymentForTask({
          taskId: task.id,
          transaction,
        });
      } else if (payment.status !== "RELEASED") {
        throw new Error("Only held payments can be released.");
      }

      await task.update({ status: "COMPLETED" }, { transaction });
      await assignment.update(
        { status: "COMPLETED", completed_at: new Date() },
        { transaction },
      );

      await createTaskEvent({
        taskId: task.id,
        actorUserId: adminId,
        eventType: "PAYMENT_RELEASED",
        metadata: { disputeId: dispute.id },
        transaction,
      });
    }

    await dispute.update(
      {
        status: "RESOLVED",
        resolution: `${resolution}${resolutionNote ? `: ${resolutionNote}` : ""}`,
        resolved_by: adminId,
        resolved_at: new Date(),
      },
      { transaction },
    );

    const notifications = await createTaskNotifications({
      taskId: task.id,
      userIds: [task.requester_id, assignment.executor_id],
      type: "DISPUTE_RESOLVED",
      title: "Dispute resolved",
      message:
        resolution === "REFUND_REQUESTER"
          ? "The dispute was resolved and a requester refund was requested."
          : "The dispute was resolved with payment released to the Executor.",
      data: { disputeId: dispute.id, resolution },
      transaction,
    });

    await transaction.commit();

    if (refundRequest) {
      try {
        await schedulePaymentRefund({
          paymentId: refundRequest.id,
          taskId: refundRequest.task_id,
          reason: `DISPUTE_REFUND:${dispute.id}`,
        });
      } catch (queueError) {
        console.error("Refund job scheduling failed:", queueError);
      }
    }

    emitTaskUpdated({
      taskId: task.id,
      userIds: [task.requester_id, assignment.executor_id],
      reason: "DISPUTE_RESOLVED",
    });
    emitTaskNotifications(notifications);

    return dispute;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
