// Migration - Defines:
// What the database structure should be.

// Model - Defines:
// How our Node.js application represents/interacts with that table.

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },

    password_hash: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    auth_provider: {
      type: DataTypes.ENUM("LOCAL", "GOOGLE"),
      allowNull: false,
      defaultValue: "LOCAL",
    },

    google_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    account_status: {
      type: DataTypes.ENUM("ACTIVE", "SUSPENDED", "BANNED", "DEACTIVATED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    role: {
      type: DataTypes.ENUM("USER", "ADMIN"),
      allowNull: false,
      defaultValue: "USER",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default User;
