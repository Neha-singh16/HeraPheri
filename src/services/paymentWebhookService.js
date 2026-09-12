import sequelize from "../config/database.js";

import { Payment, PaymentWebhookEvent } from "../models/index.js";

import { createTaskEvent } from "./taskEventService.js";

import { createLedgerEntryOnce } from "./ledgerService.js";

import {
  createTaskNotifications,
  emitTaskNotifications,
} from "./taskNotificationService.js";

import { emitTaskUpdated } from "../socket/taskEvents.js";

export async function processPaymentWebhook({ eventId, eventType, payload }) {
  const transaction = await sequelize.transaction();

  try {
    /*
      Lock the webhook record if it already exists.
    */
    let webhookEvent = await PaymentWebhookEvent.findOne({
      where: {
        provider_event_id: eventId,
      },

      transaction,

      lock: transaction.LOCK.UPDATE,
    });

    /*
      Already processed:
      safe to ignore duplicate delivery.
    */
    if (webhookEvent?.status === "PROCESSED") {
      await transaction.commit();

      return {
        duplicate: true,
      };
    }

    /*
      First delivery.
    */
    if (!webhookEvent) {
      try {
        webhookEvent = await PaymentWebhookEvent.create(
          {
            provider_event_id: eventId,

            event_type: eventType,

            payload,

            status: "RECEIVED",
          },

          {
            transaction,
          },
        );
      } catch (error) {
        /*
          Another concurrent request may have
          inserted the same event first.

          Ask MySQL for the existing record.
        */
        webhookEvent = await PaymentWebhookEvent.findOne({
          where: {
            provider_event_id: eventId,
          },

          transaction,

          lock: transaction.LOCK.UPDATE,
        });

        if (!webhookEvent) {
          throw error;
        }

        if (webhookEvent.status === "PROCESSED") {
          await transaction.commit();

          return {
            duplicate: true,
          };
        }
      }
    }

    /*
      We currently process successful payment
      events only.
    */
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = payload?.payload?.payment?.entity;

      const orderEntity = payload?.payload?.order?.entity;

      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;

      const razorpayPaymentId = paymentEntity?.id;

      if (!razorpayOrderId) {
        throw new Error("Webhook does not contain a Razorpay order ID.");
      }

      const payment = await Payment.findOne({
        where: {
          provider_order_id: razorpayOrderId,
        },

        transaction,

        lock: transaction.LOCK.UPDATE,
      });

      /*
        Payment may not exist yet if the webhook
        reaches us before our application finishes
        creating its local payment record.
      */

      if (!payment) {
        throw new Error("Local payment record not found yet.");
      }

      if (payment) {
        /*
          Never move a financial state backwards.
        */
        if (
          !["RELEASED", "REFUND_REQUESTED", "REFUNDED"].includes(payment.status)
        ) {
          await payment.update(
            {
              provider_payment_id:
                razorpayPaymentId || payment.provider_payment_id,

              status: "HELD",

              paid_at: payment.paid_at || new Date(),
            },

            {
              transaction,
            },
          );

          /*
            Ledger idempotency protects us if
            the same logical payment-success event
            reaches this code again.
          */
          await createLedgerEntryOnce({
            paymentId: payment.id,

            taskId: payment.task_id,

            userId: payment.requester_id,

            entryType: "PAYMENT_HELD",

            amount: payment.gross_amount,

            direction: "DEBIT",

            reference: razorpayPaymentId || `WEBHOOK:${eventId}`,

            transaction,
          });

          await createTaskEvent({
            taskId: payment.task_id,

            actorUserId: payment.requester_id,

            eventType: "PAYMENT_HELD",

            metadata: {
              source: "RAZORPAY_WEBHOOK",

              webhookEventId: eventId,
            },

            transaction,
          });

          const notifications = await createTaskNotifications({
            taskId: payment.task_id,

            userIds: [payment.requester_id, payment.executor_id],

            type: "PAYMENT_HELD",

            title: "Task funded",

            message:
              "The task payment has been secured and is ready for execution.",

            data: {
              source: "RAZORPAY_WEBHOOK",

              webhookEventId: eventId,
            },

            transaction,
          });

          /*
            Mark webhook processed only after all
            domain changes succeeded.
          */
          await webhookEvent.update(
            {
              status: "PROCESSED",

              processed_at: new Date(),
            },

            {
              transaction,
            },
          );

          await transaction.commit();

          /*
            Realtime notifications happen only
            after the DB transaction succeeds.
          */
          emitTaskUpdated({
            taskId: payment.task_id,

            userIds: [payment.requester_id, payment.executor_id],

            reason: "PAYMENT_HELD",
          });

          emitTaskNotifications(notifications);

          return {
            duplicate: false,
          };
        }
      }
    }

    /*
      Non-payment-success events still count as
      successfully received/processed.
    */
    await webhookEvent.update(
      {
        status: "PROCESSED",

        processed_at: new Date(),
      },

      {
        transaction,
      },
    );

    await transaction.commit();

    return {
      duplicate: false,
    };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}
