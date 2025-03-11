import { Sport, Stat } from '../models/index.js';
import { promises as fs } from "fs";
import path from "path";

// Function to get default stats from JSON
const defaultStatsData = async (sportName) => {
  try {
    const filePath = path.resolve("config/defaultStatsData.json");
    const data = await fs.readFile(filePath, "utf-8");
    const defaultStats = JSON.parse(data);
    return defaultStats[sportName] || [];
  } catch (error) {
    console.error("Error reading default stats JSON:", error);
    return [];
  }
};

// Get stats by sport ID
export const getStatsBySport = async (req, res) => {
  try {
    const { sportId } = req.params;
    const userId = req.session.user.id;

    if (!sportId || !userId) {
      return res.status(400).json({ message: "Sport ID and User ID are required" });
    }

    let stats = await Stat.findAll({ 
      where: { sportId, userId },
      order: [["order", "ASC"]] // ✅ Fetch stats in correct order
    });

    if (stats.length === 0) {
      const sport = await Sport.findByPk(sportId);
      if (!sport) return res.status(404).json({ message: "Sport not found" });

      // ✅ Get default stats from JSON (Fix: Await the function)
      const defaultStats = await defaultStatsData(sport.name);

      await Stat.bulkCreate(
        defaultStats.map((stat, index) => ({
          sportId,
          userId,
          name: stat.name,
          shortName: stat.shortName,
          order: index, // ✅ Set initial order
        }))
      );

      stats = await Stat.findAll({ where: { sportId, userId }, order: [["order", "ASC"]] });
    }

    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};





// Create a new stat
export const createStat = async (req, res) => {
  try {
    const { sportId, name, shortName } = req.body;
    const userId = req.session.user.id; // Get the logged-in user's ID

    if (!sportId || !name || !shortName || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newStat = await Stat.create({ sportId, userId, name, shortName });

    res.status(201).json(newStat);
  } catch (error) {
    console.error("Error creating stat:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Update a stat
export const updateStat = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, shortName } = req.body;
    const userId = req.session.user.id;

    const stat = await Stat.findOne({ where: { id, userId } }); // ✅ Ensure user owns this stat

    if (!stat) {
      return res.status(404).json({ message: "Stat not found or not owned by the user" });
    }

    await stat.update({ name, shortName });

    res.json(stat);
  } catch (error) {
    console.error("Error updating stat:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// Delete a stat
export const deleteStat = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;

    const stat = await Stat.findOne({ where: { id, userId } }); // ✅ Ensure user owns this stat

    if (!stat) {
      return res.status(404).json({ message: "Stat not found or not owned by the user" });
    }

    await stat.destroy();
    res.json({ message: "Stat deleted successfully" });
  } catch (error) {
    console.error("Error deleting stat:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const resetStats = async (req, res) => {
  try {
    const { sportId } = req.body;
    const userId = req.session.user.id;

    if (!sportId || !userId) {
      return res.status(400).json({ message: "Sport ID and User ID are required" });
    }

    const sport = await Sport.findByPk(sportId);
    if (!sport) return res.status(404).json({ message: "Sport not found" });

    // ✅ Delete only this user's stats
    await Stat.destroy({ where: { sportId, userId } });

    // ✅ Get default stats from JSON (Fix: Await the function)
    const defaultStats = await defaultStatsData(sport.name);

    // ✅ Insert unique stats
    for (const stat of defaultStats) {
      const existingStat = await Stat.findOne({
        where: { sportId, userId, name: stat.name }
      });

      if (!existingStat) {
        await Stat.create({
          sportId,
          userId,
          name: stat.name,
          shortName: stat.shortName
        });
      }
    }

    res.json({ message: `Stats for ${sport.name} reset to default for the user.` });
  } catch (error) {
    console.error("Error resetting stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const reorderStats = async (req, res) => {
  try {
    const { stats } = req.body;
    if (!stats || !Array.isArray(stats)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    for (const stat of stats) {
      await Stat.update({ order: stat.order }, { where: { id: stat.id } });
    }

    res.json({ message: "Stats reordered successfully" });
  } catch (error) {
    console.error("Error reordering stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
