'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adding the 'hidden' column to the 'stats' table
    await queryInterface.addColumn('stats', 'hidden', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Stat will be visible by default
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Removing the 'hidden' column in case of rollback
    await queryInterface.removeColumn('stats', 'hidden');
  }
};
