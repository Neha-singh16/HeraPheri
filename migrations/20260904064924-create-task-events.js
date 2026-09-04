'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("task_events", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },

    task_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "tasks",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    actor_user_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },

    event_type: {
      type: Sequelize.ENUM(
        "TASK_CREATED",
        "TASK_ASSIGNED",
        "TASK_STARTED",
        "TASK_ARRIVED",
        "PROOF_SUBMITTED",
        "TASK_APPROVED",
        "TASK_DISPUTED",
        "TASK_CANCELLED",
        "TASK_EXPIRED",
        "PAYMENT_HELD",
        "PAYMENT_RELEASED",
        "PAYMENT_REFUNDED"
      ),
      allowNull: false,
    },

    metadata: {
      type: Sequelize.JSON,
      allowNull: true,
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex(
    "task_events",
    ["task_id", "created_at"],
    {
      name: "task_events_task_created_idx",
    }
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("task_events");
}