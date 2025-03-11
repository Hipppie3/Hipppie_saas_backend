import { League, Sport, Team, Player, User, PlayerGameStat, Stat, Game } from '../models/index.js'

// Create Player with Image Upload
export const createPlayer = async (req, res) => {
  const { firstName, lastName, age, teamId } = req.body; // Remove leagueId from body
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
    const parsedTeamId = teamId ? parseInt(teamId, 10) : null;
    if (age && isNaN(parsedAge)) return res.status(400).json({ message: "Invalid age format" });
    if (teamId && isNaN(parsedTeamId)) return res.status(400).json({ message: "Invalid teamId format" });

    // Fetch team and get leagueId from it
    const team = parsedTeamId ? await Team.findByPk(parsedTeamId) : null;
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // ✅ Automatically set leagueId from team
    const leagueId = team.leagueId;

    // Create Player
    const player = await Player.create({
      firstName,
      lastName,
      age: parsedAge,
      image,
      userId: req.user.id,
      leagueId, // ✅ Set leagueId from team
      teamId: parsedTeamId,
    });

    // Fetch the created player with full team details
    const playerWithTeam = await Player.findOne({
      where: { id: player.id },
      include: { model: Team, as: "team" },
    });

    res.status(201).json({ message: "Player created successfully", player: playerWithTeam });
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};




export const getPlayers = async (req, res) => {
  try {
    const { domain } = req.query;
    const userId = req.session.user?.id;
    const isSuperAdmin = req.session.user?.role === "super_admin";

    console.log(domain)

    let players = [];
    if (isSuperAdmin) {
      // Super admin can see all players
      players = await Player.findAll({
        include: [
          { model: League, as: "league" },
          { model: Team, as: "team" },
        ],
      });
    } else if (domain) {
      // Find the user associated with the domain
      const user = await User.findOne({ where: { domain } });
      console.log(user.id)
      if (!user) {
        return res.status(404).json({ message: "No players found for this domain" });
      }
      const leagues = await League.findAll({ where: { userId: user.id } });
      console.log("Leagues Found:", leagues);

      players = await Player.findAll({
        include: [
          {
            model: League,
            as: "league",
            where: { userId: user.id }, // Ensure players are from leagues belonging to the domain user
          },
          { model: Team, as: "team" },
        ],
      });
    } else if (userId) {
      // Normal user can only see players from their own leagues
      players = await Player.findAll({
        include: [
          {
            model: League,
            as: "league",
            where: { userId }, // Ensure players are from leagues belonging to the user
          },
          { model: Team, as: "team" },
        ],
      });
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const formattedPlayers = players.map((player) => ({
      ...player.toJSON(),
      image: player.image
        ? `data:image/jpeg;base64,${player.image.toString("base64")}` // ✅ Keep image data
        : null,
      imageAvailable: !!player.image, // ✅ Also indicate if an image exists
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
    const player = await Player.findByPk(id, {
      include: [
        { model: Team, as: "team" },
        { model: League, as: "league" },
        {
          model: PlayerGameStat,
          as: "gameStats",
          include: [
            { model: Stat, as: "stat" },
            {
              model: Game,
              as: "game",
              attributes: ["id", "date"],
              include: [
                { model: Team, as: "homeTeam", attributes: ["id", "name"] },
                { model: Team, as: "awayTeam", attributes: ["id", "name"] },
              ],
            },
          ],
        },
      ],
    });

    if (!player) return res.status(404).json({ message: "Player not found" });

    // ✅ Fetch userId from player
    const user = await User.findByPk(player.userId, {
      include: [{ model: Sport, as: "sports", through: { attributes: [] } }],
    });

    if (!user || !user.sports.length) {
      return res.status(400).json({ message: "Sport ID could not be determined for this player" });
    }

    // ✅ Extract sportId
    const sportId = user.sports[0].id;

    // ✅ Fetch all stats for the determined sportId
    const allStats = await Stat.findAll({
      where: { sportId, userId: player.userId }
    });
    console.log(allStats)
    // ✅ Merge gameStats with allStats to ensure missing stats are set to 0
    const playerStats = await PlayerGameStat.findAll({
      where: { player_id: id},
      include: [{ model: Stat, as: "stat"}]
    })

    res.status(200).json({
      player, allStats, playerStats
    });
  } catch (error) {
    console.error("Error fetching player:", error);
    res.status(500).json({ message: "Failed to fetch player" });
  }
};




export const updatePlayer = async (req, res) => {
  try {
    const { firstName, lastName, age, teamId } = req.body;
    const image = req.file ? req.file.buffer : null; // ✅ Store raw binary data
    const player = await Player.findByPk(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    let leagueId = player.leagueId; // Default to existing leagueId

    // ✅ If teamId is updated, fetch the new team to get the correct leagueId
    if (teamId) {
      const team = await Team.findByPk(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      leagueId = team.leagueId; // ✅ Assign correct leagueId
    }
    // ✅ Update fields only if new values are provided
    player.firstName = firstName || player.firstName;
    player.lastName = lastName || player.lastName;
    player.age = age ? parseInt(age, 10) : player.age;
    player.teamId = teamId ? parseInt(teamId, 10) : player.teamId;
    player.leagueId = leagueId; // ✅ Ensure leagueId updates

    // ✅ Store image as BLOB (binary) in the database
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
