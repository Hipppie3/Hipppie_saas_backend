import { Sport, Stat } from '../models/index.js';

export const getStatsBySport = async (req, res) => {
  try {
    const { id } = req.params;

    // Find sport
    const sport = await Sport.findByPk(id);

    if (!sport) {
      return res.status(404).json({ message: `Sport ${sportName} not found.` });
    }

    // Find stats linked to the sport
    const stats = await Stat.findAll({ where: { sportId: sport.id } });

    if (!stats.length) {
      return res.status(404).json({ message: `No stats found for ${sportName}.` });
    }

    res.json(stats);
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};
