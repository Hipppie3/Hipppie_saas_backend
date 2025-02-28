module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if Basketball already exists
    const [existingSport] = await queryInterface.sequelize.query(
      `SELECT id FROM sports WHERE name = 'Basketball' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!existingSport) {
      // Insert Basketball only if it doesn't exist
      await queryInterface.bulkInsert('sports', [
        { name: 'Basketball', createdAt: new Date(), updatedAt: new Date() },
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('sports', { name: 'Basketball' });
  },
};
