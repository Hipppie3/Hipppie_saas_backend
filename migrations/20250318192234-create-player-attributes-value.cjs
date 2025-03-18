'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable('player_attribute_values', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    player_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'players',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    attribute_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'player_attributes',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    value: {
      type: Sequelize.STRING, // Store all values as strings, can convert in backend
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
  });
  },

down: async (queryInterface) => {
  await queryInterface.dropTable('player_attribute_values');
}
};
