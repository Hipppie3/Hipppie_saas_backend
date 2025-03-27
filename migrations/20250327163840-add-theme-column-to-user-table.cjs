'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'theme', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'light', // default to light mode
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'theme');
  }
};
