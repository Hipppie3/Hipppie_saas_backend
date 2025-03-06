'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("stats", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      sportId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "sports", // ✅ Ensure it references the sports table
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL", // ✅ Matches your model (nullifies if sport is deleted)
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      shortName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("stats");
  },
};
