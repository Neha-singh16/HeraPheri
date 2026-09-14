import express from "express";

import {
  authenticate,
  requireAdmin,
} from "../middleware/authMiddleware.js";

import {
  getAdminOverviewController,
  getAdminUsersController,
  updateUserStatusController,

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

export default router;