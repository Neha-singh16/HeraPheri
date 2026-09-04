'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("task_assignments", {
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

    executor_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    status: {
      type: Sequelize.ENUM(
        "ACTIVE",
        "RELEASED",
        "COMPLETED",
        "CANCELLED"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    accepted_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    started_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    arrived_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    completed_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    released_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });

  await queryInterface.addIndex(
    "task_assignments",
    ["executor_id", "status"],
    {
      name: "task_assignments_executor_status_idx",
    }
  );

  await queryInterface.addIndex(
    "task_assignments",
    ["task_id", "status"],
    {
      name: "task_assignments_task_status_idx",
    }
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("task_assignments");
}