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
      allowNull: false,
    },

    account_status: {
      type: DataTypes.ENUM(
        "ACTIVE",
        "SUSPENDED",
        "BANNED",
        "DEACTIVATED"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;