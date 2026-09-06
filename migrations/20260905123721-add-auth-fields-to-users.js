'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("users", "auth_provider", {
    type: Sequelize.ENUM("LOCAL", "GOOGLE"),
    allowNull: false,
    defaultValue: "LOCAL",
  });

  await queryInterface.addColumn("users", "google_id", {
    type: Sequelize.STRING(255),
    allowNull: true,
    unique: true,
  });

  await queryInterface.changeColumn("users", "password_hash", {
    type: Sequelize.TEXT,
    allowNull: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("users", "google_id");
  await queryInterface.removeColumn("users", "auth_provider");
  await queryInterface.changeColumn("users", "password_hash", {
    type: "TEXT",
    allowNull: false,
  });
}