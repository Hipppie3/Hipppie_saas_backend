import { GamePeriod, Sport } from "../models/index.js";
import { promises as fs } from "fs";
import path from "path";

// ✅ Function to get default game periods from JSON
// ✅ Function to get default game periods from JSON
const defaultGamePeriod = async (sportName) => {
  try {
    const filePath = path.resolve("config/defaultPeriods.json");
    const data = await fs.readFile(filePath, "utf-8");
    const defaultPeriods = JSON.parse(data);
    return defaultPeriods[sportName] || []; // Adjust sport name if needed
  } catch (error) {
    console.error("Error reading default periods JSON:", error);
    return [];
  }
};

// ✅ Get Game Periods (If none exist, insert default periods)
export const getGamePeriodBySport = async (req, res) => {
  try {
    const { sportId } = req.params;
    const userId = req.session.user.id;

    if (!sportId || !userId) {
      return res.status(400).json({ message: "Sport ID and User ID are required" });
    }

    let gamePeriod = await GamePeriod.findAll({
      where: { sportId, userId },
    });

    if (gamePeriod.length === 0) {
      const sport = await Sport.findByPk(sportId);
      if (!sport) return res.status(404).json({ message: "Sport not found" });

      const defaultPeriodsData = await defaultGamePeriod(sport.name); // Renamed variable to avoid conflict

      await GamePeriod.bulkCreate(
        defaultPeriodsData.map((gamePeriod) => ({
          sportId,
          userId,
          name: gamePeriod.name,
          periodNumber: gamePeriod.periodNumber,
        }))
      );
      gamePeriod = await GamePeriod.findAll({ where: { sportId, userId } });
    }
    res.json(gamePeriod);
  } catch (error) {
    console.error("Error fetching game periods:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const getDefaultGamePeriods = async (req, res) => {
  try {
    const { sportId } = req.params;
    console.log("Fetching default game periods for sportId:", sportId);


    const sport = await Sport.findByPk(sportId);
    if (!sportId) {
      return res.status(400).json({ message: "Sport ID is required" });
    }
    console.log(sport)
    const defaultPeriods = await defaultGamePeriod(sport.name);
    console.log("Default periods:", defaultPeriods); // ✅ Log what we are returning

    res.json(defaultPeriods);
  } catch (error) {
    console.error("Error fetching default game periods:", error);
    res.status(500).json({ message: "Server error" });
  }
};





export const createGamePeriod = async (req, res) => {
  try {
    const { name, score_team1, score_team2 } = req.body;
    const userId = req.session.user.id; // Get user ID from session

    if (!userId || !name) {
      return res.status(400).json({ message: "User ID and name are required" });
    }

    const newPeriod = await GamePeriod.create({
      sportId: req.body.sportId, // Use the sportId from the request body
      userId,
      name,
      score_team1: score_team1 || null,
      score_team2: score_team2 || null,
    });

    res.status(201).json(newPeriod);
  } catch (error) {
    console.error("Error creating game period:", error);
    res.status(500).json({ message: "Server error" });
  }
};



export const deleteGamePeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user.id;

    const period = await GamePeriod.findOne({ where: { id, userId } });

    if (!period) {
      return res.status(404).json({ message: "Game period not found or not owned by user" });
    }

    await period.destroy();
    res.json({ message: "Game period deleted successfully" });
  } catch (error) {
    console.error("Error deleting game period:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const resetGamePeriod = async (req, res) => {
  try {
    const { sportId } = req.params; // sportId comes from the URL parameter
    console.log(sportId); // Log to confirm it's being received

    const userId = req.session.user.id;

    if (!sportId) {
      return res.status(400).json({ message: "Sport ID is required" });
    }

    // Fetch the sport to get the sport name
    const sport = await Sport.findByPk(sportId);
    if (!sport) {
      return res.status(404).json({ message: "Sport not found" });
    }

    // Delete existing game periods for this sport and user
    await GamePeriod.destroy({
      where: { sportId, userId }, // Only delete periods associated with this sport and user
    });

    // Get the default game periods from the JSON file
    const defaultPeriods = await defaultGamePeriod(sport.name);

    // Insert the default game periods into the database
    const createdPeriods = await GamePeriod.bulkCreate(
      defaultPeriods.map((period) => ({
        sportId,
        userId,
        name: period.name,
        score_team1: null,
        score_team2: null,
      }))
    );

    res.json(createdPeriods); // Send the newly created periods as the response
  } catch (error) {
    console.error("Error resetting game periods:", error);
    res.status(500).json({ message: "Server error" });
  }
};
