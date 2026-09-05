'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("task_proofs", {
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

    uploaded_by: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    proof_type: {
      type: Sequelize.ENUM(
        "PHOTO",
        "VIDEO",
        "RECEIPT",
        "DOCUMENT",
        "OTP",
        "TEXT_RESULT",
        "FILE"
      ),
      allowNull: false,
    },

    storage_key: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },

    text_content: {
      type: Sequelize.TEXT,
      allowNull: true,
    },

    metadata: {
      type: Sequelize.JSON,
      allowNull: true,
    },

    review_status: {
      type: Sequelize.ENUM(
        "PENDING",
        "APPROVED",
        "REJECTED"
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    submitted_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },

    reviewed_at: {
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
    "task_proofs",
    ["task_id", "submitted_at"],
    {
      name: "task_proofs_task_submitted_idx",
    }
  );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("task_proofs");
}