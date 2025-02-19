import { League, Team, Player, User } from '../models/index.js'

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

export const getPlayers = async (req, res) => {
  try {
    let players;
    const userId = req.session?.user?.id;
    const domain = req.query.domain;
    const isSuperAdmin = req.session?.user?.role === "super_admin";
    console.log(domain)
    if (isSuperAdmin) {
      players = await Player.findAll()
    } else if (userId) {
      players = await Player.findAll({ 
        where: {userId},
        include: {
          model: Team, as: "teams"
        },
      })
    } else if (domain) {
      const user = await User.findOne({ 
        where: {domain}})
      if (!user) {
        return res.status(404).json({ messsage: "No Players found for this domain" });
      }
      players = await Player.findAll();
    } else {
      return res.status(403).json({ message: "Unauthorized or no players available" })
    }
    res.status(200).json({
      message: players.length ? "Players fetched successfully" : "No players found",
      players
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(505).json({ message: "Failed to fetch players"});
  }
};

export const getPlayerById = async (req, res) => {
  try{
  const { id } = req.params;
  const userId = req.session?.user?.id;
  const domain = req.query.domain;
  const isSuperAdmin = req.session?.user?.role === "super_admin";
    console.log(id)
  let player;
 if (isSuperAdmin) {
      player = await Player.findByPk(id)
    } else if (userId) {
      player = await Player.findByPk({ 
        where: {id, userId}
      })
    } else if (domain) {
      const user = await User.findOne({ 
        where: {domain},
        include: {
          model: Team, as: "teams"
        },
      })
      if (!user) {
        return res.status(404).json({ messsage: "No Players found for this domain" });
      }
      player = await Player.findByPk(id);
    } else {
      return res.status(403).json({ message: "Unauthorized or no players available" })
    }
    res.status(200).json({
      message: player.length ? "Players fetched successfully" : "No players found",
      player
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(505).json({ message: "Failed to fetch players"});
  }
}


export const updatePlayer = async (req, res) => {
  const {id} = req.params
  const {firstName, lastName, age, leagueId, teamId} = req.body;

  try {
    const player = await Player.findByPk(id)
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    await player.update({
      firstName: firstName || player.firstName,
      lastName: lastName || player.lastName,
      age: age || player.age,
      leagueId: leagueId || player.leagueId,
      teamId: teamId || player.teamId,
    })
    res.status(201).json({ message: "Player updated successfully,", player })
  } catch (error) {
    console.error("Error updating player:", error)
    res.status(500).json({ message: "Failed to update player" })
  }
};

export const deletePlayer = async (req, res) => {
  const { id } = req.params;

  try {
    const player = await Player.findByPk(id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    } 
    await player.destroy();
    res.status(200).json({ success: true, message: "Player deleted successfully" });
  } catch (error) {
    console.error("Error deleting player:", error);
    res.status(500).json({ message: 'Failed to delete player'});
  }
};
