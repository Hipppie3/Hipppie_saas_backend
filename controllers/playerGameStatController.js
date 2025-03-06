import PlayerGameStat from "../models/playerGameStat.js";
import Stat from "../models/stat.js" // To include stat details

// Update or Insert Player Game Stat
export const updatePlayerStat = async (req, res) => {
  try {
    console.log("📥 Received Request Body:", req.body);
    const { player_id, game_id, stats } = req.body;
    if (!player_id || !game_id || !stats || !Array.isArray(stats)) {
      console.error("❌ Missing required fields:", { player_id, game_id, stats });
      return res.status(400).json({ error: "Missing required fields" });
    }
    const updatedStats = [];
    for (const stat of stats) {
      console.log(`Processing stat_id: ${stat.stat_id} for player_id: ${stat.player_id} in game_id: ${game_id}`);
      if (!stat.stat_id || stat.value === undefined) {
        console.error("❌ Invalid stat data:", stat);
        continue;
      }
      const [playerStat, created] = await PlayerGameStat.findOrCreate({
        where: { player_id: stat.player_id, game_id, stat_id: stat.stat_id },
        defaults: { value: stat.value },
      });
      if (!created) {
        playerStat.value = stat.value;
        await playerStat.save();
      }
      updatedStats.push(playerStat);
    }
    res.status(200).json({ message: "Stats updated successfully", updatedStats });
  } catch (error) {
    console.error("❌ Error updating player stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};





// Get All Player Stats for a Game
export const getGamePlayerStats = async (req, res) => {
  try {
    const { game_id } = req.params;

    if (!game_id) {
      return res.status(400).json({ error: "Game ID is required" });
    }

    const playerStats = await PlayerGameStat.findAll({
      where: { game_id },
      include: [{ model: Stat, as: "stat" }], // Include stat details
    });

    res.status(200).json({ game_id, playerStats });
  } catch (error) {
    console.error("Error fetching player stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
