import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const LedgerEntry = sequelize.define(
  "LedgerEntry",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    task_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    payment_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    entry_type: {
      type: DataTypes.ENUM(
        "PAYMENT_HELD",
        "PLATFORM_FEE",
        "EXECUTOR_EARNING",
        "REFUND",
        "PAYOUT",
        "ADJUSTMENT"
      ),
      allowNull: false,
    },

    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    direction: {
      type: DataTypes.ENUM(
        "CREDIT",
        "DEBIT"
      ),
      allowNull: false,
    },

    reference: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "ledger_entries",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

export default LedgerEntry;