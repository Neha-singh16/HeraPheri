import {
  DataTypes,
} from "sequelize";

import sequelize from "../config/database.js";

const Verification =
  sequelize.define(
    "Verification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      verification_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "IDENTITY",
      },

      status: {
        type: DataTypes.STRING(30),
        allowNull: false,
        defaultValue: "PENDING",
      },

      provider: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      provider_reference: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },

      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      verified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "verifications",

      timestamps: true,

      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

export default Verification;