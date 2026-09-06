import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";

import {
  createPaymentOrderController,
  verifyPaymentController,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/tasks/:taskId/order",
  authenticate,
  createPaymentOrderController
);

router.post(
  "/:paymentId/verify",
  authenticate,
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