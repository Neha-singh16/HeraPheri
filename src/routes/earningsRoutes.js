import express from "express";

import {
  authenticate,
} from "../middleware/authMiddleware.js";

import {
  getExecutorEarningsController,
} from "../controllers/earningsController.js";

const router = express.Router();

router.get(
  "/mine",
  authenticate,
  getExecutorEarningsController,
);

export default router;