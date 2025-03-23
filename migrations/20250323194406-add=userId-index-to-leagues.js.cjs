'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('leagues', ['userId'], {
      name: 'leagues_userId_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('leagues', 'leagues_userId_idx');
  },
};
