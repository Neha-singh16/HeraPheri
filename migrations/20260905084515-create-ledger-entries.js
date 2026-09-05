'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("ledger_entries", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },

    user_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    task_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "tasks",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    payment_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "payments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    entry_type: {
      type: Sequelize.ENUM(
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
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },

    direction: {
      type: Sequelize.ENUM(
        "CREDIT",
        "DEBIT"
      ),
      allowNull: false,
    },

    reference: {
      type: Sequelize.STRING(255),
      allowNull: true,
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex(
    "ledger_entries",
    ["user_id", "created_at"],
    {
      name: "ledger_entries_user_created_idx",
    }
  );

  await queryInterface.addIndex(
    "ledger_entries",
    ["task_id", "created_at"],
    {
      name: "ledger_entries_task_created_idx",
    }
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("ledger_entries");
}