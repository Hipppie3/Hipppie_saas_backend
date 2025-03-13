'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('game_period_scores', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      gamePeriodId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'game_periods',
          key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      gameId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'games',
          key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      },
      period_score_team1: {
        type: Sequelize.INTEGER,
        allowNull: true, // Score for team 1 in this game period
      },
      period_score_team2: {
        type: Sequelize.INTEGER,
        allowNull: true, // Score for team 2 in this game period
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('game_period_scores');
  }
};
