'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('games', 'date', {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('games', 'date', {
      type: Sequelize.DATE, // revert back to full timestamp if needed
      allowNull: true,
    });
  },
};
