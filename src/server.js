import dotenv from "dotenv";
import http from "http";

import app from "./app.js";

import sequelize from "./config/database.js";

import {
  connectRedis,
} from "./config/redis.js";

import {
  initializeSocket,
} from "./socket/index.js";

dotenv.config();

const PORT =
  process.env.PORT || 5000;

async function startServer() {
  try {

     // 1. Connect to MySQL
    await sequelize.authenticate();

    console.log(
      "✅ MySQL connection established successfully."
    );
  // 2. Connect to Redis
    await connectRedis();

    // 3. Create HTTP server
    const httpServer =
      http.createServer(app);

    // 4. Attach Socket.IO
    initializeSocket(
      httpServer
    );
    // 5. Start server
    httpServer.listen(
      PORT,
      () => {
        console.log(
          `🚀 HEREPHERI server running on port ${PORT}`
        );

        console.log(
          `🔌 Socket.IO running on port ${PORT}`
        );
      }
    );

  } catch (error) {

    console.error(
      "❌ Server startup failed:",
      error
    );

    process.exit(1);
  }
}

startServer();
