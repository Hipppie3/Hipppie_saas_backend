import { League, Team, Player } from '../models/index.js'

// Create Player
export const createPlayer = async (req, res) => {
  const { firstName, lastName, age, leagueId, teamId } = req.body;
  
  if (!firstName) {
    return res.status(400).json({ message: "First name is required" });
  }

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: No user session" });
    }

    // Find league if leagueId exists
    let league = null;
    if (leagueId) {
      league = await League.findOne({ where: { id: leagueId, userId: req.user.id } });
      if (!league) {
        return res.status(404).json({ message: "League not found or not owned by user" });
      }
    }

    // Find team if teamId exists
    let team = null;
    if (teamId) {
      team = await Team.findOne({ where: { id: teamId, userId: req.user.id } });
      if (!team) {
        return res.status(404).json({ message: "Team not found or not owned by user" });
      }
    }

    // Create player
    const player = await Player.create({
      firstName,
      lastName,
      age,
      userId: req.user.id,
      leagueId: league ? league.id : null, // Set to league's ID if found, otherwise null
      teamId: team ? team.id : null, // Set to team's ID if found, otherwise null
    });

    res.status(201).json({ message: "Player created successfully", player });
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Get All Players

