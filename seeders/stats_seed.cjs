module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { Sport, Stat } = await import('../models/index.js');

    // Find Sports
    const basketball = await Sport.findOne({ where: { name: 'Basketball' } });
    const volleyball = await Sport.findOne({ where: { name: 'Volleyball' } });

    if (!basketball || !volleyball) {
      throw new Error('One or more sports not found. Ensure they exist in the Sports table.');
    }

    // Basketball Stats
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

    // Volleyball Stats
    const volleyballStats = [
      { name: 'Kills', shortName: 'K' },
      { name: 'Assists', shortName: 'AST' },
      { name: 'Digs', shortName: 'DIG' },
      { name: 'Blocks', shortName: 'BLK' },
      { name: 'Service Aces', shortName: 'ACE' },
      { name: 'Errors', shortName: 'ERR' },
      { name: 'Total Attacks', shortName: 'ATT' },
    ];

    // Insert Basketball Stats (Avoid Duplicates)
    const existingBasketballStats = await Stat.findAll({ where: { sportId: basketball.id } });
    if (existingBasketballStats.length === 0) {
      await Stat.bulkCreate(
        basketballStats.map((stat) => ({
          sportId: basketball.id,
          name: stat.name,
          shortName: stat.shortName,
        }))
      );
    }

    // Insert Volleyball Stats (Avoid Duplicates)
    const existingVolleyballStats = await Stat.findAll({ where: { sportId: volleyball.id } });
    if (existingVolleyballStats.length === 0) {
      await Stat.bulkCreate(
        volleyballStats.map((stat) => ({
          sportId: volleyball.id,
          name: stat.name,
          shortName: stat.shortName,
        }))
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    const { Sport, Stat } = await import('../models/index.js');

    // Find Sports
    const basketball = await Sport.findOne({ where: { name: 'Basketball' } });
    const volleyball = await Sport.findOne({ where: { name: 'Volleyball' } });

    // Delete Basketball Stats
    if (basketball) {
      await Stat.destroy({ where: { sportId: basketball.id } });
    }

    // Delete Volleyball Stats
    if (volleyball) {
      await Stat.destroy({ where: { sportId: volleyball.id } });
    }
  },
};
