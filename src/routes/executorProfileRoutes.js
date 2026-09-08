import express from "express";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  createExecutorProfileController,
  getExecutorProfileController,
  updateAvailabilityController,
  updateLocationController,
} from "../controllers/executorProfileController.js";

const router = express.Router();

// Every Executor Profile operation requires login.
router.use(authenticate);

router.post(
  "/",
  createExecutorProfileController
);

router.get(
  "/",
  getExecutorProfileController
);

router.patch(
  "/availability",
  updateAvailabilityController
);

router.patch(
  "/location",
  updateLocationController
);

export default router;