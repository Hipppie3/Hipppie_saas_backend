import { League, Team, Player, User, PlayerGameStat, Stat, Game } from '../models/index.js'

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
      include: { model: Team, as: "team" }, // Ensure this matches your Sequelize association
    });
    res.status(201).json({ message: "Player created successfully", player: playerWithTeam });
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getPlayers = async (req, res) => {
  try {
    const players = await Player.findAll({
      include: [
        { model: League, as: "league" },
        { model: Team, as: "team" },
      ],
    });
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
              attributes: ["id", "date"], // ✅ Fetch game date only
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
    res.status(200).json({
      message: "Player fetched successfully",
      player: {
        ...player.toJSON(),
        image: player.image
          ? `data:image/jpeg;base64,${player.image.toString("base64")}` // ✅ Keep image data
          : null,
        imageAvailable: !!player.image, // ✅ Also indicate if an image exists
      },
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

    // ✅ Update fields only if new values are provided
    player.firstName = firstName || player.firstName;
    player.lastName = lastName || player.lastName;
    player.age = age ? parseInt(age, 10) : player.age;
    player.teamId = teamId ? parseInt(teamId, 10) : player.teamId;

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
