'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("executor_profiles", {
    user_id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    bio: {
      type: Sequelize.TEXT,
      allowNull: true,
    },

    is_available: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    trust_score: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },

    completion_rate: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },

    on_time_rate: {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
    },

    total_tasks: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    completed_tasks: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    current_location: {
      type: Sequelize.GEOMETRY("POINT", 4326),
      allowNull: true,
    },

    last_location_at: {
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

  // await queryInterface.addIndex(
  //   "executor_profiles",
  //   ["current_location"],
  //   {
  //     name: "executor_profiles_location_idx",
  //     type: "SPATIAL",
  //   }
  // );
}

export async function down(queryInterface) {
  await queryInterface.dropTable("executor_profiles");
}