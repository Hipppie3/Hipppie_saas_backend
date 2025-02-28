module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Dynamically import models (since they are ES modules)
    const { Sport, Stat } = await import('../models/index.js');

    // Find Basketball Sport ID using Sequelize Model
    const basketball = await Sport.findOne({ where: { name: 'Basketball' } });

    if (!basketball) {
      throw new Error('Basketball sport not found. Ensure it exists in the Sports table.');
    }

    // Default basketball stats
    const basketballStats = [
      { name: 'Points', shortName: 'PTS' },
      { name: 'Assists', shortName: 'AST' },
      { name: 'Rebounds', shortName: 'REB' },
      { name: 'Steals', shortName: 'STL' },
      { name: 'Blocks', shortName: 'BLK' },
      { name: 'Turnovers', shortName: 'TO' },
      { name: 'Field Goals Made', shortName: 'FGM' },
      { name: 'Field Goals Attempted', shortName: 'FGA' },
      { name: 'Free Throws Made', shortName: 'FTM' },
      { name: 'Free Throws Attempted', shortName: 'FTA' },
      { name: 'Three-Pointers Made', shortName: '3PM' },
      { name: 'Three-Pointers Attempted', shortName: '3PA' },
    ];

    // Check if stats already exist to avoid duplicates
    const existingStats = await Stat.findAll({ where: { sportId: basketball.id } });

    if (existingStats.length === 0) {
      // Insert basketball stats into the Stats table
      await Stat.bulkCreate(
        basketballStats.map((stat) => ({
          sportId: basketball.id,
          name: stat.name,
          shortName: stat.shortName,
        }))
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Dynamically import models (since they are ES modules)
    const { Sport, Stat } = await import('../models/index.js');

    // Delete only basketball-related stats using Sequelize model
    const basketball = await Sport.findOne({ where: { name: 'Basketball' } });

    if (basketball) {
      await Stat.destroy({ where: { sportId: basketball.id } });
    }
  },
};
