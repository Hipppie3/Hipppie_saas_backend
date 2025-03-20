import {League, Team} from '../models/index.js'


export const getLeaguesAndTeams = async (req, res) => {
  try {
    const leagues = await League.findAll({
      attributes: ['id', 'name'], 
    });

    const teams = await Team.findAll({
      attributes: ['id', 'name', 'leagueId'],
      include: [{ model: League, as: "league", attributes: ["id", "name"] }]
    });

    res.status(200).json({ message: "Data fetched successfully", leagues, teams });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Failed to fetch data" });
  }
};


