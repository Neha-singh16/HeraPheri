import express from "express";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  getNotificationsController,
  markNotificationAsReadController,
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  getNotificationsController
);

router.patch(
  "/:notificationId/read",
  markNotificationAsReadController
);

export default router;
