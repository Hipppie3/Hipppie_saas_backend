'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('teams', ['userId'], {
      name: 'teams_userId_idx',
    });

    await queryInterface.addIndex('teams', ['leagueId'], {
      name: 'teams_leagueId_idx',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('teams', 'teams_userId_idx');
    await queryInterface.removeIndex('teams', 'teams_leagueId_idx');
  },
};
