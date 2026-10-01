'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  const columns = await queryInterface.describeTable('users');

  if (!columns.notification_preferences) {
    await queryInterface.addColumn('users', 'notification_preferences', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  }
}

export async function down(queryInterface) {
  const columns = await queryInterface.describeTable('users');

  if (columns.notification_preferences) {
    await queryInterface.removeColumn('users', 'notification_preferences');
  }
}