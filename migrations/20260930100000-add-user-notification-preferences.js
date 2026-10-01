'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'notification_preferences', {
    type: Sequelize.JSON,
    allowNull: true,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('users', 'notification_preferences');
}