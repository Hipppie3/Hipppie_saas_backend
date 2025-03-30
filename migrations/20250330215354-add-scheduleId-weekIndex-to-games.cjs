'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('games', 'scheduleId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'schedules',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('games', 'weekIndex', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('games', 'scheduleId');
    await queryInterface.removeColumn('games', 'weekIndex');
  }
};
