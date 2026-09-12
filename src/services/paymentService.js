import sequelize from "../config/database.js";
import razorpay from "../config/razorpay.js";
import { verifyPaymentSignature } from "../utils/razorpay.js";
import { emitTaskUpdated } from "../socket/taskEvents.js";
import { Task, TaskAssignment, Payment, LedgerEntry } from "../models/index.js";
import { createTaskEvent } from "./taskEventService.js";
import { createLedgerEntryOnce } from "./ledgerService.js";
import {
  createTaskNotifications,
  emitTaskNotifications,
} from "./taskNotificationService.js";

export async function createPaymentOrder(taskId, requesterId) {
  const transaction = await sequelize.transaction();
  try {
    const task = await Task.findOne({
      where: {
        id: taskId,
        requester_id: requesterId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!task) {
      throw new Error("Task not found or you are not the requester.");
    }

    if (!["ASSIGNED", "IN_PROGRESS"].includes(task.status)) {
      throw new Error("Payment cannot be created at this stage.");
    }

    const assignment = await TaskAssignment.findOne({
      where: {
        task_id: taskId,
        status: "ACTIVE",
      },
      transaction,
    });

    if (!assignment) {
      throw new Error("An active Executor is required before payment.");
    }

    const existingPayment = await Payment.findOne({
      where: {
        task_id: taskId,
      },
      transaction,
    });

    if (
      existingPayment &&
      ["HELD", "RELEASED", "REFUND_REQUESTED", "REFUNDED"].includes(
        existingPayment.status,
      )
    ) {
      throw new Error("Payment already exists for this task.");
    }

    const platformFee = Number(task.reward_amount) * 0.1;

    const executorAmount = Number(task.reward_amount);

    // Razorpay expects the amount in the smallest currency unit.
    const amountInPaise = Math.round(
      (Number(task.reward_amount) + platformFee) * 100,
    );

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: task.id,
    });

    const payment = existingPayment
      ? await existingPayment.update(
          {
            provider_order_id: order.id,
            provider_payment_id: null,
            gross_amount: Number(task.reward_amount) + platformFee,
            platform_fee: platformFee,
            executor_amount: executorAmount,
            status: "PENDING",
            paid_at: null,
            released_at: null,
            refunded_at: null,
          },
          { transaction },
        )
      : await Payment.create(
          {
            task_id: task.id,
            requester_id: requesterId,
            executor_id: assignment.executor_id,
            provider: "RAZORPAY",
            provider_order_id: order.id,
            gross_amount: Number(task.reward_amount) + platformFee,
            platform_fee: platformFee,
            executor_amount: executorAmount,
            currency: "INR",
            status: "PENDING",
          },
          { transaction },
        );

    await transaction.commit();

    return {
      payment,
      razorpayOrder: order,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function verifyPayment({
  paymentId,
  requesterId,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  const transaction = await sequelize.transaction();
  try {
    const payment = await Payment.findOne({
      where: {
        id: paymentId,
        requester_id: requesterId,
        provider_order_id: razorpayOrderId,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!payment) {
      throw new Error("Payment record not found.");
    }

    if (payment.status === "HELD") {
      await transaction.commit();
      return payment;
    }

    const valid = verifyPaymentSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });
    if (!valid) {
      await payment.update(
        {
          status: "FAILED",
        },
        {
          transaction,
        },
      );

      await transaction.commit();

      throw new Error("Invalid payment signature.");
    }

    await payment.update(
      {
        provider_payment_id: razorpayPaymentId,
        status: "HELD",
        paid_at: new Date(),
      },
      {
        transaction,
      },
    );

    await LedgerEntry.create(
      {
        user_id: payment.requester_id,
        task_id: payment.task_id,
        payment_id: payment.id,
        entry_type: "PAYMENT_HELD",
        amount: payment.gross_amount,
        direction: "DEBIT",
        reference: razorpayPaymentId,
      },
      {
        transaction,
      },
    );

    await createTaskEvent({
      taskId: payment.task_id,
      actorUserId: requesterId,
      eventType: "PAYMENT_HELD",
      transaction,
    });

    const notifications = await createTaskNotifications({
      taskId: payment.task_id,
      userIds: [payment.requester_id, payment.executor_id],
      type: "PAYMENT_HELD",
      title: "Task funded",
      message: "The task payment has been secured and is ready for execution.",
      transaction,
    });

    await transaction.commit();
    emitTaskUpdated({
      taskId: payment.task_id,
      userIds: [requesterId, payment.executor_id],
      reason: "PAYMENT_HELD",
    });
    emitTaskNotifications(notifications);
    // HELD?
    // This is our platform state, not necessarily Razorpay's literal payment state.
    // “The customer paid, but the Executor hasn't earned/retrieved the money yet.”
    return payment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function releasePaymentForTask({ taskId, transaction }) {
  const payment = await Payment.findOne({
    where: {
      task_id: taskId,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!payment) {
    throw new Error("Payment not found for this task.");
  }

  /*
    Idempotency:
    if the task was already approved and payment
    was already released, do not release it again.
  */
  if (payment.status === "RELEASED") {
    return payment;
  }

  /*
    Only HELD funds can be released to the Executor.
  */
  if (payment.status !== "HELD") {
    throw new Error(
      "Payment must be successfully funded before it can be released.",
    );
  }

  const releasedAt = new Date();

  await payment.update(
    {
      status: "RELEASED",
      released_at: releasedAt,
    },
    {
      transaction,
    },
  );

  /*
    Executor earnings are credited to the internal ledger.

    IMPORTANT:
    This is an internal wallet/ledger credit.
    It is NOT yet a bank payout.
  */
await createLedgerEntryOnce({
  paymentId: payment.id,
  taskId: payment.task_id,
  userId: payment.executor_id,
  entryType: "EXECUTOR_EARNING",
  amount: payment.executor_amount,
  direction: "CREDIT",
  reference: `TASK_RELEASE:${taskId}`,
  transaction,
});

  /*
    Record the platform fee separately.
    The platform does not need a user_id here.
  */
  await LedgerEntry.create(
    {
      user_id: null,
      task_id: payment.task_id,
      payment_id: payment.id,

      entry_type: "PLATFORM_FEE",

      amount: payment.platform_fee,

      direction: "CREDIT",

      reference: `PLATFORM_FEE:${taskId}`,
    },
    {
      transaction,
    },
  );

  return payment;
}

export async function requestRefundForTask({ taskId, transaction }) {
  const payment = await Payment.findOne({
    where: {
      task_id: taskId,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });

  if (!payment) {
    throw new Error("Payment not found for this task.");
  }

  // Idempotent refund.
  if (
    payment.status === "REFUNDED" ||
    payment.status === "REFUND_REQUESTED"
  ) {
    return payment;
  }

  if (payment.status !== "HELD") {
    throw new Error("Only held payments can be refunded.");
  }

  if (!payment.provider_payment_id) {
    throw new Error("The held payment has no provider payment ID.");
  }

  await payment.update(
    {
      status: "REFUND_REQUESTED",
    },
    {
      transaction,
    },
  );

  return payment;
}

export async function processRefundForTask({ taskId, reason }) {
  const payment = await Payment.findOne({
    where: {
      task_id: taskId,
    },
  });

  if (!payment) {
    throw new Error("Payment not found for this task.");
  }

  if (payment.status === "REFUNDED") {
    return payment;
  }

  if (payment.status !== "REFUND_REQUESTED") {
    throw new Error("Only requested refunds can be processed.");
  }

  if (!payment.provider_payment_id) {
    throw new Error("The requested refund has no provider payment ID.");
  }

  await razorpay.payments.refund(payment.provider_payment_id, {
    amount: Math.round(Number(payment.gross_amount) * 100),
  });

  const transaction = await sequelize.transaction();

  try {
    const lockedPayment = await Payment.findOne({
      where: {
        id: payment.id,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (lockedPayment.status === "REFUNDED") {
      await transaction.commit();
      return lockedPayment;
    }

    await lockedPayment.update(
      {
        status: "REFUNDED",
        refunded_at: new Date(),
      },
      { transaction },
    );

    await createLedgerEntryOnce({
      paymentId: lockedPayment.id,
      taskId: lockedPayment.task_id,
      userId: lockedPayment.requester_id,
      entryType: "REFUND",
      amount: lockedPayment.gross_amount,
      direction: "CREDIT",
      reference: `${reason || "REFUND"}:${lockedPayment.task_id}`,
      transaction,
    });

    await createTaskEvent({
      taskId: lockedPayment.task_id,
      actorUserId: lockedPayment.requester_id,
      eventType: "PAYMENT_REFUNDED",
      transaction,
    });

    await transaction.commit();
    return lockedPayment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
