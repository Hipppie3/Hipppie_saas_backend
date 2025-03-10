module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("stats", "order", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("stats", "order");
  },
};
