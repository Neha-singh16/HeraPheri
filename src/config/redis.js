import {
  createClient,
} from "redis";

const redisUrl =
  process.env.REDIS_URL ||
  "redis://localhost:6379";

export const redisPubClient =
  createClient({
    url: redisUrl,
  });

export const redisSubClient =
  redisPubClient.duplicate();

// Redis errors should be visible in logs.
redisPubClient.on(
  "error",
  (error) => {
    console.error(
      "❌ Redis publisher error:",
      error
    );
  }
);

redisSubClient.on(
  "error",
  (error) => {
    console.error(
      "❌ Redis subscriber error:",
      error
    );
  }
);

export async function connectRedis() {
  await Promise.all([
    redisPubClient.connect(),
    redisSubClient.connect(),
  ]);

  console.log(
    "✅ Redis connected successfully."
  );
}



// MySQL
// = source of truth

// Redis
// = fast temporary infrastructure / messaging

// Socket.IO
// = realtime connection to browser/mobile