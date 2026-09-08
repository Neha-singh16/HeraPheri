import express from "express";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  getNearbyTasksController,
} from "../controllers/taskDiscoveryController.js";

const router = express.Router();

router.get(
  "/nearby",
  authenticate,
  getNearbyTasksController
);

export default router;