module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if Basketball exists
    const [existingBasketball] = await queryInterface.sequelize.query(
      `SELECT id FROM sports WHERE name = 'Basketball' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Check if Volleyball exists
    const [existingVolleyball] = await queryInterface.sequelize.query(
      `SELECT id FROM sports WHERE name = 'Volleyball' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    // Check if Baseball exists
        const [existingBaseball] = await queryInterface.sequelize.query(
      `SELECT id FROM sports WHERE name = 'Baseball' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    // Check if Tennis exists
            const [existingTennis] = await queryInterface.sequelize.query(
      `SELECT id FROM sports WHERE name = 'Tennis' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const sportsToInsert = [];

    if (!existingBasketball) {
      sportsToInsert.push({ name: 'Basketball', createdAt: new Date(), updatedAt: new Date() });
    }

    if (!existingVolleyball) {
      sportsToInsert.push({ name: 'Volleyball', createdAt: new Date(), updatedAt: new Date() });
    }

    if (!existingBaseball) {
      sportsToInsert.push({ name: 'Baseball', createdAt: new Date(), updatedAt: new Date() });
    }

    if (!existingTennis) {
      sportsToInsert.push({ name: 'Tennis', createdAt: new Date(), updatedAt: new Date() });
    }
    if (sportsToInsert.length > 0) {
      await queryInterface.bulkInsert('sports', sportsToInsert);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('sports', {
      name: { [Sequelize.Op.in]: ['Basketball', 'Volleyball', 'Baseball', 'Tennis'] },
    });
  },
};
