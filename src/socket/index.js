import {
  Server,
} from "socket.io";

import {
  createAdapter,
} from "@socket.io/redis-adapter";

import {
  redisPubClient,
  redisSubClient,
} from "../config/redis.js";

import jwt from "jsonwebtoken";

let io;

// Initialize Socket.IO on our HTTP server.
export function initializeSocket(
  httpServer
) {
  io = new Server(
    httpServer,
    {
      cors: {
        origin:
          process.env.CLIENT_URL ||
          "*",
        credentials: true,
      },

      adapter: createAdapter(
        redisPubClient,
        redisSubClient
      ),
    }
  );

  // Authenticate every socket connection.
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error(
            "Authentication token required."
          )
        );
      }

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_ACCESS_SECRET
        );

      socket.userId =
        decoded.id ||
        decoded.userId ||
        decoded.sub;

      if (!socket.userId) {
        return next(
          new Error(
            "Invalid authentication token."
          )
        );
      }

      next();

    } catch (error) {
      next(
        new Error(
          "Socket authentication failed."
        )
      );
    }
  });

  io.on(
    "connection",
    (socket) => {
      console.log(
        `🔌 Socket connected: ${socket.id}`
      );

      /*
        Each user gets a private room.

        Example:
        user:abc123

        Any notification for that user
        can be emitted to this room.
      */
      socket.join(
        `user:${socket.userId}`
      );

      socket.emit(
        "connection:ready",
        {
          success: true,
          message:
            "Realtime connection established.",
        }
      );

      socket.on(
        "disconnect",
        (reason) => {
          console.log(
            `🔌 Socket disconnected: ${socket.id}`,
            reason
          );
        }
      );
    }
  );

  return io;
}

// Access the initialized Socket.IO instance.
export function getIO() {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized."
    );
  }

  return io;
}

// Send a notification to one specific user.
export function emitNotificationToUser(
  userId,
  notification
) {
  const socketServer =
    getIO();

  socketServer
    .to(`user:${userId}`)
    .emit(
      "notification:new",
      notification
    );
}

