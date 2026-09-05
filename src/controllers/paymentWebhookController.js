import {
  verifyWebhookSignature,
} from "../utils/razorpay.js";

import {
  processPaymentWebhook,
} from "../services/paymentWebhookService.js";

export async function paymentWebhookController(
  req,
  res
) {
  try {
    const signature =
      req.headers["x-razorpay-signature"];

    const eventId =
      req.headers["x-razorpay-event-id"];

    if (!signature || !eventId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing Razorpay webhook headers.",
      });
    }

    // req.body is a Buffer because this route uses express.raw().
    const isValid =
      verifyWebhookSignature(
        req.body,
        signature
      );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid webhook signature.",
      });
    }

    const payload =
      JSON.parse(req.body.toString("utf8"));

    const result =
      await processPaymentWebhook({
        eventId,
        eventType: payload.event,
        payload,
      });

    return res.status(200).json({
      success: true,
      received: true,
      duplicate: result.duplicate,
    });
  } catch (error) {
    console.error(
      "Payment webhook error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed.",
    });
  }
}