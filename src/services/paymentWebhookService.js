import sequelize from "../config/database.js";

import {
  Payment,
  PaymentWebhookEvent,
} from "../models/index.js";

export async function processPaymentWebhook({
  eventId,
  eventType,
  payload,
}) {
  const transaction =
    await sequelize.transaction();

  try {
    // Prevent duplicate webhook processing.
    const existingEvent =
      await PaymentWebhookEvent.findOne({
        where: {
          provider_event_id: eventId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

    if (
      existingEvent &&
      existingEvent.status === "PROCESSED"
    ) {
      await transaction.commit();

      return {
        duplicate: true,
      };
    }

    if (!existingEvent) {
      await PaymentWebhookEvent.create(
        {
          provider_event_id: eventId,
          event_type: eventType,
          payload,
          status: "RECEIVED",
        },
        {
          transaction,
        }
      );
    }

    // We only care about payment success for now.
    if (
      eventType === "payment.captured" ||
      eventType === "order.paid"
    ) {
      const paymentEntity =
        payload?.payload?.payment?.entity;

      const orderEntity =
        payload?.payload?.order?.entity;

      const razorpayOrderId =
        paymentEntity?.order_id ||
        orderEntity?.id;

      const razorpayPaymentId =
        paymentEntity?.id;

      const payment =
        await Payment.findOne({
          where: {
            provider_order_id:
              razorpayOrderId,
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

      if (payment) {
        // Never move a released payment backwards.
        if (
          payment.status !== "RELEASED" &&
          payment.status !== "REFUNDED"
        ) {
          await payment.update(
            {
              provider_payment_id:
                razorpayPaymentId ||
                payment.provider_payment_id,
              status: "HELD",
              paid_at:
                payment.paid_at || new Date(),
            },
            {
              transaction,
            }
          );
        }
      }
    }

    const webhookEvent =
      await PaymentWebhookEvent.findOne({
        where: {
          provider_event_id: eventId,
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

    await webhookEvent.update(
      {
        status: "PROCESSED",
        processed_at: new Date(),
      },
      {
        transaction,
      }
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