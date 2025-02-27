'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null values now
      unique: true,
    });

    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null values now
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      allowNull: false, // Reverting to original state
      unique: true,
    });

    await queryInterface.changeColumn('users', 'password', {
      type: Sequelize.STRING,
      allowNull: false, // Reverting to original state
    });
  }
};
