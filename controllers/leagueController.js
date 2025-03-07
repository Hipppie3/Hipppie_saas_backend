import { League, Team, Player, User, Game } from '../models/index.js'

// Create League
export const createLeague = async (req, res) => {
  const {name} = req.body;
  if (!name) {
  return res.status(401).json({ message: 'League name required '})
  };
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: No user session' });
    }
    const newLeague = await League.create({
    name,
    userId: req.user.id,
    });
    res.status(200).json({
    message: 'League created successfully', 
    league: newLeague
    });
  } catch (error) {
    console.error("Error creating league:", error);
    res.status(500).json({ message: 'Internal server error creating league' })
  }
};



// Get All Leagues
export const getLeagues = async (req, res) => {
  try {
    const leagues = await League.findAll({
      include: [{ model: Team, as: 'teams' }],
    });
    const formattedLeagues = leagues.map(league => ({
      ...league.dataValues, // Directly access Sequelize's dataValues
      teamsCount: league.teams ? league.teams.length : 0,
    }));
    res.status(200).json({
      message: formattedLeagues.length ? "Leagues fetched successfully" : "No leagues found",
      leagues: formattedLeagues,
    });
  } catch (error) {
    console.error("Error fetching leagues:", error);
    res.status(500).json({ message: "Failed to fetch leagues" });
  }
};


// Get League By Id
export const getLeagueById = async (req, res) => {
  const { id } = req.params;
  console.log("Fetching league with ID:", id);

  try {
    const userId = req.session?.user?.id;
    const domain = req.query.domain;
    const isSuperAdmin = req.session?.user?.role === "super_admin";
    let league;

    if (isSuperAdmin) {
      league = await League.findByPk(id, { 
        include: [
          { 
            model: Team, 
            as: 'teams',
            include: [{ model: Player, as: 'players' }] // ✅ Include players inside teams
          },  
          {
            model: Game,
            as: 'games',  // This should return all games associated with the league
            required: false, // Make sure this doesn't limit the query to just one game
          }
        ]
      });
    } else if (userId) {
      league = await League.findOne({ 
        where: { id, userId }, 
        include: [
          { 
            model: Team, 
            as: 'teams',
            include: [{ model: Player, as: 'players' }] // ✅ Include players inside teams
          },
          {
            model: Game,
            as: 'games', // This should return all games associated with the league
            required: false,
          }
        ]
      });
    } else if (domain) {
      const user = await User.findOne({ where: { domain } });
      if (!user) {
        return res.status(404).json({ message: "No leagues found for this domain" });
      }
      league = await League.findOne({ 
        where: { id, userId: user.id }, 
        include: [
          { 
            model: Team, 
            as: 'teams',
            include: [{ model: Player, as: 'players' }] // ✅ Include players inside teams
          },
          {
            model: Game,
            as: 'games',  // This should return all games associated with the league
            required: false,
          }
        ]
      });
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    res.status(200).json({ message: "League fetched successfully", league });
  } catch (error) {
    console.error("Error fetching league:", error);
    res.status(500).json({ message: "Failed to fetch league" });
  }
};



// Update League
export const updateLeague = async (req, res) => {
  const {name} = req.body
  const {id} = req.params;

  try {
    const league = await League.findByPk(id);
    console.log(league)
    if (!league) {
      return res.status(404).json({ message: "League not found"})
    };
    await league.update({
      name: name || league.name,
    })
    res.status(200).json({ message: "League updated successfully", league})
  } catch (error) {
    console.error("Error updating league:", error);
    res.status(500).json({ message: "Failed to update league" })
  }
}


// Delete League
export const deleteLeague = async (req, res) => {
const { id } = req.params;
try {
  const league = await League.findByPk(id);
  console.log(league)
  if (!league) {
  return res.status(404).json({ message: "League not found" });
  }
  await league.destroy();
  res.status(200).json({ success: true, message: "League deleted successfully" });
} catch (error) {
  console.error("Error deleting league:", error);
  res.status(500).json({ message: "Failed to delete league" });
}
};


