'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable('player_attributes', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    attribute_name: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    attribute_type: {
      type: Sequelize.ENUM('string', 'number', 'boolean', 'date'), // Extendable for different input types
      allowNull: false,
    },
    order: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0,
    },
    is_visible: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
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
  await queryInterface.dropTable('player_attributes');
}
};
