import { League, Sport, Team, Player, User, PlayerGameStat, Stat, Game, PlayerAttributeValue, PlayerAttribute} from '../models/index.js';
import s3 from '../config/aws.js'; // Import the AWS S3 configuration
import { PutObjectCommand } from '@aws-sdk/client-s3'; // AWS SDK v3
import { DeleteObjectCommand } from '@aws-sdk/client-s3'; // For deleting from S3

export const createPlayer = async (req, res) => {
  try {
    const { firstName, lastName, teamId, attributes } = req.body;
    const image = req.file ? req.file : null;
    const userId = req.user.id; 

    if (!firstName) {
      return res.status(400).json({ message: "First name is required" });
    }

let leagueId = null;

if (teamId) {
  const team = await Team.findByPk(teamId);
  if (!team) return res.status(404).json({ message: "Team not found" });
  leagueId = team.leagueId;
}


    // ✅ Upload Image to S3 (if provided)
    let imageUrl = null;
    if (image) {
      const fileName = `${Date.now()}-${image.originalname}`;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `players/${fileName}`,
        Body: image.buffer,
        ContentType: image.mimetype,
      };
      await s3.send(new PutObjectCommand(uploadParams));
      imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/players/${fileName}`;
    }

    // ✅ Create Player
    const player = await Player.create({
      firstName,
      lastName,
      image: imageUrl,
      userId,
      leagueId,
      teamId,
    });

    // ✅ Get Default Attributes for User
    const playerAttributes = await PlayerAttribute.findAll({ where: { user_id: userId } });

    // ✅ Create PlayerAttributeValues (Set Empty by Default)
    const playerAttributeValues = playerAttributes.map((attr) => ({
      player_id: player.id,
      attribute_id: attr.id,
      value: attributes?.[attr.attribute_name] || "", // If provided, use value from request
    }));

    await PlayerAttributeValue.bulkCreate(playerAttributeValues);

    res.status(201).json({ message: "Player created successfully", player });
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

    if (domain) {
      // ✅ Public view with domain
      const user = await User.findOne({ where: { domain } });
      if (!user) {
        return res.status(404).json({ message: "No players found for this domain" });
      }

      players = await Player.findAll({
        where: { userId: user.id }, // ✅ Top-level filter for domain user
        include: [
          { model: League, as: "league", required: false },
          { model: Team, as: "team", required: false },
          {
            model: PlayerAttributeValue,
            as: "attributeValues",
            include: [{ model: PlayerAttribute, as: "attribute" }],
          },
        ],
      });

    } else if (userId) {
      // ✅ Logged-in admin view
      players = await Player.findAll({
        where: { userId }, // ✅ Top-level filter for logged-in user
        include: [
          { model: League, as: "league", required: false },
          { model: Team, as: "team", required: false },
          {
            model: PlayerAttributeValue,
            as: "attributeValues",
            include: [{ model: PlayerAttribute, as: "attribute" }],
          },
        ],
      });

    } else if (isSuperAdmin) {
      // ✅ Super admin gets everything
      players = await Player.findAll({
        include: [
          { model: League, as: "league", required: false },
          { model: Team, as: "team", required: false },
          {
            model: PlayerAttributeValue,
            as: "attributeValues",
            include: [{ model: PlayerAttribute, as: "attribute" }],
          },
        ],
      });

    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const formattedPlayers = players.map((player) => ({
      ...player.toJSON(),
      image: player.image ? player.image.toString() : null,
      imageAvailable: !!player.image,
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
    const { domain } = req.query;
    const sessionUserId = req.session.user?.id;
    const isSuperAdmin = req.session.user?.role === "super_admin";

    let userIdToMatch;

    if (domain) {
      const user = await User.findOne({ where: { domain } });
      if (!user) return res.status(404).json({ message: "Invalid domain" });
      userIdToMatch = user.id;
    } else if (sessionUserId) {
      userIdToMatch = sessionUserId;
    }

    // 🔐 SuperAdmin can bypass filter
    const player = await Player.findOne({
      where: isSuperAdmin ? { id } : { id, userId: userIdToMatch },
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
        {
          model: PlayerAttributeValue,
          as: "attributeValues",
          include: [{ model: PlayerAttribute, as: "attribute" }],
        },
      ],
    });

    if (!player) return res.status(404).json({ message: "Player not found" });

    const defaultAttributes = await PlayerAttribute.findAll({
      where: { user_id: player.userId },
    });

    const playerAttributeIds = player.attributeValues.map(pav => pav.attribute_id);

    for (const attribute of defaultAttributes) {
      if (!playerAttributeIds.includes(attribute.id)) {
        await PlayerAttributeValue.create({
          player_id: player.id,
          attribute_id: attribute.id,
          value: "",
        });
      }
    }

    const user = await User.findByPk(player.userId, {
      include: [{ model: Sport, as: "sports", through: { attributes: [] } }],
    });

    const sportId = user?.sports?.[0]?.id || [];

    const allStats = await Stat.findAll({
      where: { sportId, userId: player.userId },
    });

    const playerStats = await PlayerGameStat.findAll({
      where: { player_id: id },
      include: [{ model: Stat, as: "stat" }],
    });

    res.status(200).json({
      message: "Player fetched successfully",
      player: {
        ...player.toJSON(),
        image: player.image || null,
      },
      allStats,
      playerStats,
    });

  } catch (error) {
    console.error("Error fetching player:", error);
    res.status(500).json({ message: "Failed to fetch player" });
  }
};





export const updatePlayer = async (req, res) => {
  try {
    const { firstName, lastName, teamId, attributes } = req.body;
    const image = req.file ? req.file : null;
    const { id } = req.params;
    console.log(teamId)
    const player = await Player.findByPk(id);
    if (!player) return res.status(404).json({ message: "Player not found" });

 let parsedTeamId = teamId === '' || teamId === undefined ? null : parseInt(teamId);

if (parsedTeamId) {
  const team = await Team.findByPk(parsedTeamId);
  if (!team) return res.status(404).json({ message: "Team not found" });
  player.teamId = parsedTeamId;
  player.leagueId = team.leagueId;
} else {
  // Explicitly clear team and league if team is being removed
  player.teamId = null;
  player.leagueId = null;
}


    // ✅ Update Player Fields
    player.firstName = firstName || player.firstName;
    player.lastName = lastName || player.lastName;

    // ✅ Upload Image (If New Image is Provided)
    if (image) {
      const fileName = `${Date.now()}-${image.originalname}`;
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `players/${fileName}`,
        Body: image.buffer,
        ContentType: image.mimetype,
      };
      await s3.send(new PutObjectCommand(uploadParams));
      player.image = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/players/${fileName}`;
    }

    await player.save();

    // ✅ Update Player Attributes (Only If Provided)
    if (attributes) {
      for (const [attributeName, value] of Object.entries(attributes)) {
        const attribute = await PlayerAttribute.findOne({
          where: { user_id: player.userId, attribute_name: attributeName },
        });

        if (attribute) {
          const playerAttributeValue = await PlayerAttributeValue.findOne({
            where: { player_id: id, attribute_id: attribute.id },
          });

          if (playerAttributeValue) {
            await playerAttributeValue.update({ value });
          } else {
            await PlayerAttributeValue.create({
              player_id: id,
              attribute_id: attribute.id,
              value,
            });
          }
        }
      }
    }

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

