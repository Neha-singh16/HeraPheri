import express from "express";
import cors from "cors";
import helmet from "helmet";

import taskExecutionRoutes from "./routes/taskExecutionRoutes.js";
import taskAssignmentRoutes from "./routes/taskAssignmentRoutes.js";
import taskReviewRoutes from "./routes/taskReviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import paymentWebhookRoutes from "./routes/paymentWebhookRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

import executorProfileRoutes from "./routes/executorProfileRoutes.js";
import taskDiscoveryRoutes from "./routes/taskDiscoveryRoutes.js";
import matchingRoutes from "./routes/matchingRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import { requestContext } from "./middleware/requestContext.js";

import { requestLogger } from "./middleware/requestLogger.js";

import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import earningsRoutes from "./routes/earningsRoutes.js";
import adminDisputeRoutes from "./routes/adminDisputeRoutes.js";
import {
  authLimiter,
  paymentLimiter,
  apiLimiter,
} from "./middleware/rateLimiters.js";

const app = express();
app.set("trust proxy", 1);

app.use(requestContext);

app.use(requestLogger);

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      const allowedOrigins = [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
      ]
        .filter(Boolean)
        .map((allowedOrigin) => allowedOrigin.replace(/\/+$/, ""));

      /*
        Allow server-to-server requests / tools that do not
        send an Origin header.
      */
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS."));
    },

    credentials: true,
  }),
);

// Webhook must receive the raw request body.
app.use(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentWebhookRoutes,
);

app.use(express.json());
/*
  General API protection.
*/
app.use("/api/v1", apiLimiter);

/*
  Authentication gets stricter protection.
*/
app.use("/api/v1/auth", authLimiter);

/*
  Payments get stricter protection.
*/
app.use("/api/v1/payments", paymentLimiter);

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/verifications", verificationRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/executor-profile", executorProfileRoutes);

app.use("/api/v1/tasks", taskDiscoveryRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/tasks", taskExecutionRoutes);
app.use("/api/v1/matching", matchingRoutes);
app.use("/api/v1/task-assignments", taskAssignmentRoutes);

app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/tasks", taskReviewRoutes);
app.use("/api/v1/ratings", ratingRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/earnings", earningsRoutes);
app.use("/api/v1/admin/disputes", adminDisputeRoutes);
app.get("/health", async (req, res) => {
  return res.status(200).json({
    success: true,
    service: "HEREPHERI API",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

export default app;
