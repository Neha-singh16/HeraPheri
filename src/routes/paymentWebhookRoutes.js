import express from "express";

import {
  paymentWebhookController,
} from "../controllers/paymentWebhookController.js";

const router = express.Router();

router.post(
  "/",
  paymentWebhookController
);

export default router;