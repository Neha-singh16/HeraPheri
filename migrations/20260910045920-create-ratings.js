"use strict";

/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("ratings", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
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

    reviewer_id: {
      type: Sequelize.UUID,
      allowNull: false,

      references: {
        model: "users",
        key: "id",
      },

      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    reviewed_user_id: {
      type: Sequelize.UUID,
      allowNull: false,

      references: {
        model: "users",
        key: "id",
      },

      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    rating: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },

    review: {
      type: Sequelize.TEXT,
      allowNull: true,
    },

    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },

    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.fn("NOW"),
    },
  });

  // One rating per reviewer per task.
  await queryInterface.addIndex("ratings", ["task_id", "reviewer_id"], {
    unique: true,
  });

  await queryInterface.addIndex("ratings", ["reviewed_user_id"]);

  await queryInterface.addIndex("ratings", ["task_id"]);
}

export async function down(queryInterface) {
  await queryInterface.dropTable("ratings");
}
