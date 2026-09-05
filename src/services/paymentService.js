import sequelize from "../config/database.js";
import razorpay from "../config/razorpay.js";
import {
  verifyWebhookSignature,
} from "../utils/razorpay.js";

import { Task, TaskAssignment, Payment, LedgerEntry } from "../models/index.js";

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

    if (existingPayment) {
      throw new Error("Payment already exists for this task.");
    }

    const platformFee = Number(task.reward_amount) * 0.1;

    const executorAmount = Number(task.reward_amount);

    // Razorpay expects the amount in the smallest currency unit.
    const amountInPaise = Math.round(
      (Number(task.reward_amount) + platformFee) * 100,
    );

    const payment = await Payment.create(
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
      {
        transaction,
      },
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
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  const transaction = await sequelize.transaction();
  try {
    const payment = await Payment.findOne({
      where: {
        id: paymentId,
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

    const valid =  verifyWebhookSignature({
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

    await transaction.commit();
// HELD?
// This is our platform state, not necessarily Razorpay's literal payment state.
// “The customer paid, but the Executor hasn't earned/retrieved the money yet.”
    return payment;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

