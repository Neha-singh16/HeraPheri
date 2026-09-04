'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("tasks", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },

    requester_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },

    category: {
      type: Sequelize.ENUM("GO", "GET", "CHECK", "DIGITAL"),
      allowNull: false,
    },

    task_mode: {
      type: Sequelize.ENUM("PHYSICAL", "DIGITAL", "HYBRID"),
      allowNull: false,
    },

    title: {
      type: Sequelize.STRING(150),
      allowNull: false,
    },

    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    location: {
      type: Sequelize.GEOMETRY("POINT", 4326),
      allowNull: true,
    },

    address_text: {
      type: Sequelize.STRING(500),
      allowNull: true,
    },

    deadline_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    reward_amount: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },

    currency: {
      type: Sequelize.STRING(3),
      allowNull: false,
      defaultValue: "INR",
    },

    risk_level: {
      type: Sequelize.ENUM("LOW", "MEDIUM", "HIGH"),
      allowNull: false,
      defaultValue: "LOW",
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
      defaultValue: "TEXT_RESULT",
    },

    status: {
      type: Sequelize.ENUM(
        "OPEN",
        "ASSIGNED",
        "IN_PROGRESS",
        "PENDING_APPROVAL",
        "COMPLETED",
        "DISPUTED",
        "CANCELLED",
        "EXPIRED"
      ),
      allowNull: false,
      defaultValue: "OPEN",
    },

    expires_at: {
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

  await queryInterface.addIndex("tasks", ["requester_id", "created_at"], {
    name: "tasks_requester_created_idx",
  });

  await queryInterface.addIndex("tasks", ["status", "deadline_at"], {
    name: "tasks_status_deadline_idx",
  });

  await queryInterface.addIndex("tasks", ["category", "status"], {
    name: "tasks_category_status_idx",
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("tasks");
}