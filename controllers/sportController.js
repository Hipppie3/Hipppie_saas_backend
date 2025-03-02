import { Sport } from '../models/index.js';

export const getSports = async (req, res) => {
  try {
    const sports = await Sport.findAll();
    if (!sports.length) {
      return res.status(404).json({ message: 'No sports found' });
    }
    res.json(sports);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sports', error });
  }
};

export const getSportById = async (req, res) => {
  const {id} = req.params;
  try {
    const sport = await Sport.findByPk(id);
    if (!sport) {
      return res.status(404).json({ message: "No sport found" });
    }
    res.json(sport);
  } catch (error) {
    res.status(500).json({ message: `Error fetching sport`, error });
  }
};
