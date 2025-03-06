'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("player_game_stats", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      player_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "players", // Ensuring foreign key reference
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      game_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "games", // Ensuring foreign key reference
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      stat_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "stats", // Ensuring foreign key reference
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("player_game_stats");
  },
};
