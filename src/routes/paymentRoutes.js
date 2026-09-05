import express from "express";

import {
  createPaymentOrderController,
  verifyPaymentController,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/tasks/:taskId/order",
  createPaymentOrderController
);

router.post(
  "/:paymentId/verify",
  verifyPaymentController
);
export default router;



// REQUESTER
//     │
//     │ Create payment
//     ▼
// HEREPHERI
//     │
//     ▼
// RAZORPAY TEST MODE
//     │
//     │ order
//     ▼
// RAZORPAY CHECKOUT
//     │
//     │ successful payment
//     ▼
// payment credentials
//     │
//     ▼
// HEREPHERI
//     │
//     │ verify signature
//     ▼
// MySQL payment
//     │
//     ▼
// HELD