import { League, Team, Player, User, Game } from '../models/index.js'
import { Sequelize } from 'sequelize'

// Create League
export const createLeague = async (req, res) => {
  const { name, seasonId } = req.body;

  if (!name || !seasonId) {
    return res.status(400).json({ message: 'League name and seasonId are required' });
  }

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: No user session' });
    }

    const newLeague = await League.create({
      name,
      userId: req.user.id,
      seasonId, // ✅ Store seasonId in the league
    });

    res.status(200).json({
      message: 'League created successfully',
      league: newLeague
    });
  } catch (error) {
    console.error("Error creating league:", error);
    res.status(500).json({ message: 'Internal server error creating league' });
  }
};



// Get All Leagues
export const getLeagues = async (req, res) => {
  try {
    const { domain } = req.query;
    const userId = req.session?.user?.id; // ✅ Now optional
    const isSuperAdmin = req.session?.user?.role === "super_admin";

    let leagues = [];
 
    if (isSuperAdmin) {
      // Super admin can see all leagues
      leagues = await League.findAll({
        include: [{ model: Team, as: 'teams' }],
      });
    } else if (domain) {
      // Find the user associated with the domain
      const user = await User.findOne({ where: { domain } });
      if (!user) {
        return res.status(404).json({ message: "No leagues found for this domain" });
      }
      leagues = await League.findAll({
        where: { userId: user.id },
        include: [{ model: Team, as: 'teams' }],
      });
    } else if (userId) {
      // Normal user can only see their own leagues
      leagues = await League.findAll({
        where: { userId },
        include: [{ model: Team, as: 'teams' }],
      });
    } else {
      // Public view: Show all leagues (optional - decide if public should see all)
      leagues = await League.findAll({
        include: [{ model: Team, as: 'teams' }],
      });
    }
    const formattedLeagues = leagues.map(league => ({
      ...league.dataValues,
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
            attributes: ['id', 'name', 'leagueId', 'wins', 'losses'], // ✅ Exclude stored wins/losses
          },  
          {
            model: Game,
            as: 'games',
            required: false,
            attributes: ['id', 'team1_id', 'team2_id', 'score_team1', 'score_team2', 'status', 'date'],
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
            attributes: ['id', 'name', 'leagueId', 'wins', 'losses'], // ✅ Exclude stored wins/losses
          },
          {
            model: Game,
            as: 'games',
            required: false,
            attributes: ['id', 'team1_id', 'team2_id', 'score_team1', 'score_team2', 'status', 'date', 'location', 'time'],
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
            attributes: ['id', 'name', 'leagueId', 'wins', 'losses'], // ✅ Exclude stored wins/losses
          },
          {
            model: Game,
            as: 'games',
            required: false,
            attributes: ['id', 'team1_id', 'team2_id', 'score_team1', 'score_team2', 'status', 'date'],
          }
        ]
      });
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }
    if (!league.teams || !Array.isArray(league.teams) || league.teams.length === 0) {
      league.teams = [];
    }

    // ✅ Check if games array exists and is not empty
    if (!league.games || !Array.isArray(league.games) || league.games.length === 0) {
      league.games = [];
    }

    // ✅ Recalculate wins and losses
    const teamsMap = {};
    league.teams.forEach(team => {
      teamsMap[team.id] = { id: team.id, name: team.name, leagueId: team.leagueId, wins: 0, losses: 0 };
    });

league.games.forEach(game => {
  if (game.status === "completed") {
    // Ensure team1 exists in teamsMap
    if (teamsMap[game.team1_id]) {
      if (game.score_team1 > game.score_team2) {
        teamsMap[game.team1_id].wins++;
        teamsMap[game.team2_id].losses++;
      } else if (game.score_team2 > game.score_team1) {
        teamsMap[game.team2_id].wins++;
        teamsMap[game.team1_id].losses++;
      }
    } else {
      console.error(`Team with ID ${game.team1_id} not found in teamsMap`);
    }

    // Ensure team2 exists in teamsMap
    if (teamsMap[game.team2_id]) {
      if (game.score_team2 > game.score_team1) {
        teamsMap[game.team2_id].wins++;
        teamsMap[game.team1_id].losses++;
      } else if (game.score_team1 > game.score_team2) {
        teamsMap[game.team1_id].wins++;
        teamsMap[game.team2_id].losses++;
      }
    } else {
      console.error(`Team with ID ${game.team2_id} not found in teamsMap`);
    }
  }
});

    // ✅ Replace teams array with recalculated data
    league.teams = Object.values(teamsMap);

    res.status(200).json({ message: "League fetched successfully", league });
  } catch (error) {
    console.error("Error fetching league:", error);
    res.status(500).json({ message: "Failed to fetch league" });
  }
};




// Update League
export const updateLeague = async (req, res) => {
  const { name, seasonId } = req.body; // Add seasonId here
  const { id } = req.params;

  try {
    const league = await League.findByPk(id);
    if (!league) {
      return res.status(404).json({ message: "League not found" });
    }

    // Update league name and seasonId
    await league.update({
      name: name || league.name,
      seasonId: seasonId || league.seasonId, // Update seasonId if provided
    });

    res.status(200).json({ message: "League updated successfully", league });
  } catch (error) {
    console.error("Error updating league:", error);
    res.status(500).json({ message: "Failed to update league" });
  }
};



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



// Public Frontend /teamList
export const getLeagueListWithTeamsPublic = async (req, res) => {
  try {
    const domain = req.query.domain;
    const user = req.session?.user;
    let whereClause = {};

    // Super admin can access everything
    if (user?.role === 'super_admin') {
      // No whereClause = all leagues
    } else if (user?.id) {
      whereClause.userId = user.id;
    } else if (domain) {
      const owner = await User.findOne({ where: { domain } });
      if (!owner) {
        return res.status(404).json({ message: "No leagues found for this domain" });
      }
      whereClause.userId = owner.id;
    } else {
      return res.status(403).json({ message: "Unauthorized or no leagues available" });
    }

    const leagues = await League.findAll({
      where: whereClause,
      attributes: ['id', 'name'],
      include: [
        {
          model: Team,
          as: 'teams',
          attributes: ['id', 'name', 'wins', 'losses']
        }
      ]
    });

    res.status(200).json({ leagues });
  } catch (error) {
    console.error("Error fetching leagues with teams:", error);
    res.status(500).json({ message: "Failed to fetch league list" });
  }
};



// Get Leagues in dashboard
export const getLeagueSummary = async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const isSuperAdmin = req.session?.user?.role === "super_admin";

    let whereClause = {};
    if (!isSuperAdmin && userId) {
      whereClause.userId = userId;
    }

    const leagues = await League.findAll({
      where: whereClause,
      attributes: ['id', 'name'],
      include: [{
        model: Team,
        as: 'teams',
        attributes: [], // Don’t fetch team data
      }],
    });

    const formatted = leagues.map(l => ({
      id: l.id,
      name: l.name,
      teamsCount: l.teams?.length ?? 0,
    }));

    res.status(200).json({ leagues: formatted });
  } catch (error) {
    console.error("Error fetching summary:", error);
    res.status(500).json({ message: "Failed to fetch league summary" });
  }
};
