
import {
  createPaymentOrder,
  verifyPayment,
} from "../services/paymentService.js";

export async function createPaymentOrderController(
  req,
  res
) {
  try {
    const { taskId } = req.params;

    const requesterId = req.user.id;

    const result = await createPaymentOrder(
      taskId,
      requesterId
    );

    return res.status(201).json({
      success: true,
      message: "Payment order created.",
      data: result,
    });
  } catch (error) {
    console.error(
      "Create payment order error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function verifyPaymentController(
  req,
  res
) {
  try {
    const { paymentId } = req.params;

    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = req.body;

    const payment = await verifyPayment({
      paymentId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      data: payment,
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}