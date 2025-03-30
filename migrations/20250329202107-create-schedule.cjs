'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('schedules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      leagueId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'leagues',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      numWeeks: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      gameDays: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      weeklyDates: {
        type: Sequelize.ARRAY(Sequelize.DATE),
        allowNull: true
      },
      sameSlot: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      timeSlots: {
        type: Sequelize.ARRAY(Sequelize.STRING), // For the same time slots every week
        allowNull: true,
      },
      weeklyTimeSlots: {
        type: Sequelize.ARRAY(Sequelize.ARRAY(Sequelize.STRING)), // For different time slots each week
        allowNull: true,
      },
      isTemplate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('schedules');
  }
};
