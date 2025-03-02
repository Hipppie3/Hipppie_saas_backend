import { League, Team, Player, User } from '../models/index.js'

// Create Player with Image Upload
export const createPlayer = async (req, res) => {
  const { firstName, lastName, age, leagueId, teamId } = req.body;
  const image = req.file ? req.file.buffer : null;

  if (!firstName) {
    return res.status(400).json({ message: "First name is required" });
  }

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: No user session" });
    }
    // Convert values to numbers
    const parsedAge = age ? parseInt(age, 10) : null;
    const parsedLeagueId = leagueId ? parseInt(leagueId, 10) : null;
    const parsedTeamId = teamId ? parseInt(teamId, 10) : null;
    if (age && isNaN(parsedAge)) return res.status(400).json({ message: "Invalid age format" });
    if (leagueId && isNaN(parsedLeagueId)) return res.status(400).json({ message: "Invalid leagueId format" });
    if (teamId && isNaN(parsedTeamId)) return res.status(400).json({ message: "Invalid teamId format" });
    // Validate League and Team Ownership
    let league = parsedLeagueId
      ? await League.findOne({ where: { id: parsedLeagueId, userId: req.user.id } })
      : null;
    if (parsedLeagueId && !league) {
      return res.status(404).json({ message: "League not found or not owned by user" });
    }
    let team = parsedTeamId
      ? await Team.findOne({ where: { id: parsedTeamId, userId: req.user.id } })
      : null;
    if (parsedTeamId && !team) {
      return res.status(404).json({ message: "Team not found or not owned by user" });
    }
    // Create Player
    const player = await Player.create({
      firstName,
      lastName,
      age: parsedAge,
      image,
      userId: req.user.id,
      leagueId: parsedLeagueId,
      teamId: parsedTeamId,
    });
    // Fetch the created player with full team details
    const playerWithTeam = await Player.findOne({
      where: { id: player.id },
      include: { model: Team, as: "teams" }, // Ensure this matches your Sequelize association
    });
    res.status(201).json({ message: "Player created successfully", player: playerWithTeam });
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getPlayers = async (req, res) => {
  try {
    let players;
    const userId = req.session?.user?.id;
    const domain = req.query.domain;
    const isSuperAdmin = req.session?.user?.role === "super_admin";
    if (isSuperAdmin) {
      players = await Player.findAll({ include: [
        { model: League, as: 'league'},
        { model: Team, as: 'team'}
      ]});
    } else if (userId) {
      players = await Player.findAll({
        where: {userId},
        include: [
        { model: League, as: 'league'},
        { model: Team, as: 'team'}
        ]
      });
    } else if (domain) {
      const user = await User.findOne({ where: {domain}})
      if (!user) {
        return res.status(404).json({ message: "No Players found for this domain" });
      }
      players = await Player.findAll({
      where: { userId: user.id},
      include: [
        { model: League, as: "league" },
        { model: Team, as: "team"}
      ]
    });
  } else {
    return res.status(403).json({ message: "Unauthorized or no players available" });
  }
    const formattedPlayers = players.map((player) => ({
      ...player.toJSON(),
      image: player.image ? `data:image/jpeg;base64,${player.image.toString("base64")}` : null
      
    }));

    res.status(200).json({
      message: formattedPlayers.length ? "Players fetched successfully" : "No players found",
      players: formattedPlayers,
    });
  } catch (error) {
    console.error("Error fetching players:", error);
    res.status(500).json({ message: "Failed to fetch players" });
  }
};


export const getPlayerById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.user?.id;
    const domain = req.query.domain;
    const isSuperAdmin = req.session?.user?.role === "super_admin";

    let player;

    if (isSuperAdmin) {
      player = await Player.findByPk(id, {
        include: [
          { model: Team, as: "team" },
          { model: League, as: "league" },
        ],
      });
    } else if (userId) {
      player = await Player.findOne({
        where: { id, userId },
        include: [
          { model: Team, as: "team" },
          { model: League, as: "league" },
        ],
      });
    } else if (domain) {
      const user = await User.findOne({ where: { domain } });
      if (!user) {
        return res.status(404).json({ message: "No players found for this domain" });
      }

      player = await Player.findOne({
        where: { id, userId: user.id },
        include: [
          { model: Team, as: "team" },
          { model: League, as: "league" },
        ],
      });
    } else {
      return res.status(403).json({ message: "Unauthorized or no players available" });
    }

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // ✅ Convert BLOB image to Base64 before sending response
    const playerData = {
      ...player.toJSON(),
      image: player.image ? `data:image/jpeg;base64,${player.image.toString("base64")}` : null,
    };

    res.status(200).json({
      message: "Player fetched successfully",
      player: playerData,
    });
  } catch (error) {
    console.error("Error fetching player:", error);
    res.status(500).json({ message: "Failed to fetch player" });
  }
};



export const updatePlayer = async (req, res) => {
  try {
    const { firstName, lastName, age, teamId } = req.body;
    const image = req.file ? req.file.buffer : null; 

    const player = await Player.findByPk(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Ensure parsed integer values
    player.firstName = firstName || player.firstName;
    player.lastName = lastName || player.lastName;
    player.age = age ? parseInt(age, 10) : player.age;
    player.teamId = teamId ? parseInt(teamId, 10) : player.teamId;

    // Update image if a new one is provided
    if (image) {
      player.image = image;
    }

    await player.save();
    res.json({ message: "Player updated successfully", player });
  } catch (error) {
    console.error("Error updating player:", error);
    res.status(500).json({ message: "Internal Server Error" });
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
