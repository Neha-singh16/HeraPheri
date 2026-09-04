import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();

    console.log("✅ MySQL connection established successfully.");

    app.listen(PORT, () => {
      console.log(`🚀 HEREPHERI server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to MySQL:", error);
    process.exit(1);
  }
}

startServer();