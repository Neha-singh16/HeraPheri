import {
  DataTypes,
} from "sequelize";

import sequelize from "../config/database.js";

const Notification =
  sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue:
          DataTypes.UUIDV4,
        primaryKey: true,
      },

      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      data: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      read_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "notifications",

      timestamps: true,

      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

export default Notification;

