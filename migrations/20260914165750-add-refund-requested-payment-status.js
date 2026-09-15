'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE payments
      MODIFY COLUMN status
      ENUM(
        'PENDING',
        'AUTHORIZED',
        'HELD',
        'RELEASED',
        'REFUND_REQUESTED',
        'REFUNDED',
        'PARTIALLY_REFUNDED',
        'FAILED',
        'DISPUTED'
      )
      NOT NULL
      DEFAULT 'PENDING';
    `);
}

export async function down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE payments
      MODIFY COLUMN status
      ENUM(
        'PENDING',
        'AUTHORIZED',
        'HELD',
        'RELEASED',
        'REFUNDED',
        'PARTIALLY_REFUNDED',
        'FAILED',
        'DISPUTED'
      )
      NOT NULL
      DEFAULT 'PENDING';
    `);
}