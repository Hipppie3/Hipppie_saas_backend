import { League, Sport, Team, Player, User, PlayerGameStat, Stat, Game } from '../models/index.js';
import s3 from '../config/aws.js'; // Import the AWS S3 configuration
import { PutObjectCommand } from '@aws-sdk/client-s3'; // AWS SDK v3
import { DeleteObjectCommand } from '@aws-sdk/client-s3'; // For deleting from S3

export const createPlayer = async (req, res) => {
  const { firstName, lastName, age, teamId } = req.body; 
  const image = req.file ? req.file : null;  // Get the image file from the request

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

    const team = parsedTeamId ? await Team.findByPk(parsedTeamId) : null;
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    // Set leagueId from the team
    const leagueId = team.leagueId;

    // Image Upload to S3 using AWS SDK v3
    let imageUrl = null;
    if (image) {
      const fileName = `${Date.now()}-${image.originalname}`;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `players/${fileName}`, // Folder structure in S3
        Body: image.buffer,
        ContentType: image.mimetype,
      };

      const command = new PutObjectCommand(uploadParams); // Create the upload command
      const uploadResult = await s3.send(command); // Send to S3 using the `send` method
      imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/players/${fileName}`;
    }

    // Create the player with the image URL
    const player = await Player.create({
      firstName,
      lastName,
      age: parsedAge,
      image: imageUrl, // Store image URL
      userId: req.user.id,
      leagueId,
      teamId: parsedTeamId,
    });

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

    let players = [];
    if (isSuperAdmin) {
      players = await Player.findAll({
        include: [
          { model: League, as: "league" },
          { model: Team, as: "team" },
        ],
      });
    } else if (domain) {
      const user = await User.findOne({ where: { domain } });
      if (!user) {
        return res.status(404).json({ message: "No players found for this domain" });
      }
      const leagues = await League.findAll({ where: { userId: user.id } });

      players = await Player.findAll({
        include: [
          {
            model: League,
            as: "league",
            where: { userId: user.id },
          },
          { model: Team, as: "team" },
        ],
      });
    } else if (userId) {
      players = await Player.findAll({
        include: [
          {
            model: League,
            as: "league",
            where: { userId },
          },
          { model: Team, as: "team" },
        ],
      });
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Ensure player image is a string (URL) and not a Buffer
    const formattedPlayers = players.map((player) => ({
      ...player.toJSON(),
      image: player.image ? player.image.toString() : null, // ✅ Convert Buffer to string
      imageAvailable: !!player.image, // Indicates if the image exists
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

    // ✅ Ensure image is a string (URL) and not a Buffer
    res.status(200).json({
      message: "Player fetched successfully",
      player: {
        ...player.toJSON(),
        image: player.image ? player.image.toString() : null, // ✅ Convert Buffer to string
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
    const image = req.file ? req.file : null; // Get the image file from the request
    const player = await Player.findByPk(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    let leagueId = player.leagueId; // Default to existing leagueId

    if (teamId) {
      const team = await Team.findByPk(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      leagueId = team.leagueId; // Assign correct leagueId
    }

    // Update fields only if new values are provided
    player.firstName = firstName || player.firstName;
    player.lastName = lastName || player.lastName;
    player.age = age ? parseInt(age, 10) : player.age;
    player.teamId = teamId ? parseInt(teamId, 10) : player.teamId;
    player.leagueId = leagueId; // Ensure leagueId updates

    // Image Upload to S3 using AWS SDK v3
    if (image) {
      const fileName = `${Date.now()}-${image.originalname}`;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `players/${fileName}`, // Folder structure in S3
        Body: image.buffer,
        ContentType: image.mimetype,
      };

      const command = new PutObjectCommand(uploadParams); // Create the upload command
      const uploadResult = await s3.send(command); // Send to S3 using the `send` method
      player.image = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/players/${fileName}`; // Store image URL
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

    // If the player has an image, delete it from S3
    if (player.image) {
      await deleteImageFromS3(player.image); // Delete the image from S3
    }

    // Delete the player record from the database
    await player.destroy();
    res.status(200).json({ success: true, message: "Player deleted successfully" });
  } catch (error) {
    console.error("Error deleting player:", error);
    res.status(500).json({ message: 'Failed to delete player' });
  }
};


const deleteImageFromS3 = async (imageUrl) => {
  if (typeof imageUrl !== 'string') {
    console.error("Invalid image URL", imageUrl);
    return;  // Exit early if imageUrl is not a string
  }

  const fileName = imageUrl.split('/').pop();  // Extract the file name from the URL
  console.log("Deleting image file: ", fileName);  // Log the filename to ensure it's correct
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `players/${fileName}`, // Path in the S3 bucket
  };

  try {
    await s3.send(new DeleteObjectCommand(params));  // Use `send` to delete the file
    console.log("Image deleted from S3");
  } catch (err) {
    console.error("Error deleting image from S3:", err);
  }
};
