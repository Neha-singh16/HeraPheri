import express from "express";

import { authenticate, requireAdmin } from "../middleware/authMiddleware.js";

import {
  getAdminOverviewController,
  getAdminUsersController,
  updateUserStatusController,
  getPendingVerificationsController,
  getAdminTasksController,
  getAdminPaymentsController,
  getAdminAuditController,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authenticate);
router.use(requireAdmin);

/* Overview */
router.get("/overview", getAdminOverviewController);

/* Users */
router.get("/users", getAdminUsersController);

router.patch("/users/:userId/status", updateUserStatusController);

/* Verification */
router.get("/verifications", getPendingVerificationsController);

/* Operations */
router.get("/tasks", getAdminTasksController);

router.get("/payments", getAdminPaymentsController);

router.get("/audit", getAdminAuditController);

export default router;
