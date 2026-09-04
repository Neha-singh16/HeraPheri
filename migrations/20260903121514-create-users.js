'use strict';

/** @type {import('sequelize-cli').Migration} */
  export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("users", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },

    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },

    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    },

    phone: {
      type: Sequelize.STRING(20),
      allowNull: false,
      unique: true,
    },

    password_hash: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    account_status: {
      type: Sequelize.ENUM(
        "ACTIVE",
        "SUSPENDED",
        "BANNED",
        "DEACTIVATED"
      ),
      allowNull: false,
      defaultValue: "ACTIVE",
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
}

export async function down(queryInterface) {
  await queryInterface.dropTable("users");
}