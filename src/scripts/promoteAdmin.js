import sequelize from "../config/database.js";
import { User } from "../models/index.js";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  throw new Error("Usage: node src/scripts/promoteAdmin.js admin@example.com");
}

try {
  await sequelize.authenticate();

  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new Error(`No user found with email: ${email}`);
  }

  await user.update({
    role: "ADMIN",
  });

  console.log(`✅ ${email} is now an ADMIN.`);
} finally {
  await sequelize.close();
}
