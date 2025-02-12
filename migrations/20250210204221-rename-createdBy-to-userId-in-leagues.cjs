'use strict';


module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.renameColumn('leagues', 'createdBy', 'userId')
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.renameColumn('leagues', 'userId', 'createdBy')
  }
};
