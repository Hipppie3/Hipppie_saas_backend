'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gamePeriods', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' }, // ✅ Foreign key to User table
        onDelete: 'CASCADE',
        allowNull: false,
      },
      gameId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        allowNull: true,
      },
      sportId: {
        type: Sequelize.INTEGER,
        references: { model: 'sports', key: 'id' }, // ✅ Foreign key to Game table
        onDelete: 'CASCADE',
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false, // ✅ Example: "Quarter 1", "Set 2", "Inning 3"
      },
      score_team1: {
        type: Sequelize.INTEGER,
        allowNull: true, // ✅ Initially null, updated later
      },
      score_team2: {
        type: Sequelize.INTEGER,
        allowNull: true, // ✅ Initially null, updated later
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
    await queryInterface.dropTable('gamePeriods');
  }
};
