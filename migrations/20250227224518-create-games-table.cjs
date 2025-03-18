'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('games', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      leagueId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      team1_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      team2_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("scheduled", "completed", "canceled"),
        allowNull: true,
      },
      score_team1: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      score_team2: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      video_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,  // Can be set to false if you want to enforce a location
      },
      time: {
        type: Sequelize.TIME,
        allowNull: true,  // You can adjust this to suit the format of the game time
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('games');
  },
};
