import express from "express";

import {
  authenticate,
  requireAdmin,
} from "../middleware/authMiddleware.js";

import {
  getAdminOverviewController,
  getAdminUsersController,
  updateUserStatusController,
  getPendingVerificationsController,
  getAdminTasksController,
    getAdminAuditController,

} from "../controllers/adminController.js";



const router =
  express.Router();


router.use(authenticate);
router.use(requireAdmin);


router.get(
  "/overview",
  getAdminOverviewController,
);

router.get(
  "/users",
  getAdminUsersController,
);


router.patch(
  "/users/:userId/status",
  updateUserStatusController,
);


router.get(
  "/verifications",
  getPendingVerificationsController,
);
router.get(
  "/tasks",
  getAdminTasksController,
);

router.get(
  "/audit",
  getAdminAuditController,
);
export default router;