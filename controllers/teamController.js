import { League, Team, Player, User, Game, PlayerAttribute, PlayerAttributeValue } from '../models/index.js'
import { Sequelize } from 'sequelize'


// Create Team
export const createTeam = async (req, res) => {
 const { name, leagueId = null } = req.body;
 const { id: paramLeagueId } = req.params;

 const leagueIdToUse = paramLeagueId || leagueId;

 if (!name) {
  return res.status(400).json({ message: 'Team name required' });
 }

 try {
  if (!req.user || !req.user.id) {
   return res.status(401).json({ message: 'Unauthorized: No user session' });
  }

  if (leagueIdToUse) {
   const league = await League.findOne({ where: { id: leagueIdToUse, userId: req.user.id } });
   if (!league) {
    return res.status(403).json({ message: "You don't have permission to add team to this league" });
   }
  }

  const newTeam = await Team.create({
   name,
   userId: req.user.id,
   leagueId: leagueIdToUse || null,
  });

  res.status(201).json({
   message: 'Team created successfully',
   team: newTeam
  });
 } catch (error) {
  console.error({ message: 'Error creating team:', error });
  res.status(500).json({ message: 'Internal server error creating team' });
 }
};



// Get All Teams
export const getTeams = async (req, res) => {
  try {
    let teams;
    const userId = req.session?.user?.id;
    const domain = req.query.domain;
  console.log(domain)
    const isSuperAdmin = req.session?.user?.role === "super_admin";
    const includeOptions = [
      { model: League, as: "league" },
      { model: Player, as: "players" },
      {
        model: Game,
        as: "homeGames",
        attributes: [
          "id",
          "date",
          "status",
          "score_team1",
          "score_team2",
          "team1_id",
          "team2_id",
        ],
        include: [
          { model: Team, as: "homeTeam", attributes: ["id", "name"] },
          { model: Team, as: "awayTeam", attributes: ["id", "name"] },
        ],
      },
      {
        model: Game,
        as: "awayGames",
        attributes: [
          "id",
          "date",
          "status",
          "score_team1",
          "score_team2",
          "team1_id",
          "team2_id",
        ],
        include: [
          { model: Team, as: "homeTeam", attributes: ["id", "name"] },
          { model: Team, as: "awayTeam", attributes: ["id", "name"] },
        ],
      },
    ];
    if (isSuperAdmin) {
      teams = await Team.findAll({ include: includeOptions });
    } else if (userId) {
      teams = await Team.findAll({ where: { userId }, include: includeOptions });
    } else if (domain) {
      const user = await User.findOne({ where: { domain } });
      if (!user) {
        return res.status(404).json({ message: "No Teams found for this domain" });
      }
      teams = await Team.findAll({ where: { userId: user.id }, include: includeOptions });
    } else {
      return res.status(403).json({ message: "Unauthorized or no teams available" });
    }
    // Process each team to dynamically calculate wins, losses, and ties
    const processedTeams = teams.map((team) => {
 const games = [...team.homeGames, ...team.awayGames].map((game) => ({
  id: game.id,
  date: game.date,
  status: game.status,
  score_team1: game.score_team1,
  score_team2: game.score_team2,
  team1_id: game.team1_id,
  team2_id: game.team2_id,
}));

      let wins = 0, losses = 0, ties = 0;
  games.forEach((game) => {
  if (game.status === "completed") {
    const isHome = game.team1_id === team.id;
    const isAway = game.team2_id === team.id;

    if (isHome && game.score_team1 > game.score_team2) wins++;
    else if (isAway && game.score_team2 > game.score_team1) wins++;
    else if ((isHome || isAway) && game.score_team1 === game.score_team2) ties++;
    else if (isHome || isAway) losses++;
  }
});


      return {
        id: team.id,
        name: team.name,
        league: team.league,
        players: team.players,
        wins, // ✅ Dynamically calculated
        losses, // ✅ Dynamically calculated
        ties, // ✅ Dynamically calculated
      };
    });
    res.status(200).json({
      message: processedTeams.length ? "Teams fetched successfully" : "No teams found",
      teams: processedTeams,
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};



// Get Team By ID
export const getTeamById = async (req, res) => {
  const { id } = req.params;
  console.log("Fetching team by ID:", id);

  try {
    const userId = req.session?.user?.id;
    const domain = req.query.domain;
    const isSuperAdmin = req.session?.user?.role === "super_admin";

    let team;
    const includeOptions = [
      { model: League, as: "league" },
        { 
    model: Player, 
    as: "players",
    include: [ // ✅ Include attribute values inside players
      {
        model: PlayerAttributeValue,
        as: "attributeValues",
        include: [
          { model: PlayerAttribute, as: "attribute" }, // ✅ Include PlayerAttribute to get attribute names
        ],
      },
    ],
  },
      {
        model: Game,
        as: "homeGames",
        attributes: [
          "id",
          "date",
          "status",
          "score_team1",
          "score_team2",
          "team1_id",
          "team2_id",
        ],
        include: [
          { model: Team, as: "homeTeam", attributes: ["id", "name"] },
          { model: Team, as: "awayTeam", attributes: ["id", "name"] },
        ],
      },
      {
        model: Game,
        as: "awayGames",
        attributes: [
          "id",
          "date",
          "status",
          "score_team1",
          "score_team2",
          "team1_id",
          "team2_id",
        ],
        include: [
          { model: Team, as: "homeTeam", attributes: ["id", "name"] },
          { model: Team, as: "awayTeam", attributes: ["id", "name"] },
        ],
      },
    ];
    if (isSuperAdmin) {
      team = await Team.findByPk(id, { include: includeOptions });
    } else if (userId) {
      team = await Team.findOne({
        where: { id, userId },
        include: includeOptions,
      });
    } else if (domain) {
      const user = await User.findOne({ where: { domain } });
      if (!user) {
        return res
          .status(404)
          .json({ message: "No teams found for this domain" });
      }
      team = await Team.findOne({
        where: { id, userId: user.id },
        include: includeOptions,
      });
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }
    // Merge home and away games into one `games` array
    const games = [...team.homeGames, ...team.awayGames].map((game) => ({
      id: game.id,
      date: game.date,
      status: game.status,
      score_team1: game.score_team1,
      score_team2: game.score_team2,
      team1: game.homeTeam ? game.homeTeam.name : "Unknown",
      team2: game.awayTeam ? game.awayTeam.name : "Unknown",
    }));
    // Calculate wins, losses, and ties dynamically
    let wins = 0,
      losses = 0,
      ties = 0;
    games.forEach((game) => {
      if (game.status === "completed") {
        if (game.team1 === team.name && game.score_team1 > game.score_team2)
          wins++;
        else if (
          game.team2 === team.name &&
          game.score_team2 > game.score_team1
        )
          wins++;
        else if (game.score_team1 === game.score_team2) ties++;
        else losses++;
      }
    });
    // Return only necessary data
    res.status(200).json({
      message: "Team fetched successfully",
      team: {
        id: team.id,
        name: team.name,
        league: team.league,
        players: team.players,
        wins, // ✅ Dynamically calculated
        losses, // ✅ Dynamically calculated
        ties, // ✅ Dynamically calculated
        games,
      },
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};



export const updateTeam = async (req, res) => {
  const {name, leagueId} = req.body;
  const {id} = req.params;

  try {
    const team = await Team.findByPk(id)
    if (!team) {
      return res.status(404).json({ message: "Team not found" })
    }
    console.log(team)
    console.log(leagueId)
    await team.update({
      name: name || team.name,
      leagueId: leagueId || team.leagueId,
    })
    res.status(201).json({ message: "Team updated successfully", team })
  } catch (error) {
    console.error("Error updating team:", error)
    res.status(500).json({ message: "Failed to update team"})
  }
};


export const deleteTeam = async (req, res) => {
  const {id} = req.params;

  try {
    const team = await Team.findByPk(id)
    console.log(team)
  if (!team) {
      return res.status(404).json({ message: "Team not found"})
    };

    await team.destroy()
    res.status(201).json({ success: true, message: "Team deleted successfully" })
  } catch (error) {
    console.error("Error deleting team:", error)
    res.status(500).json({ message: "Failed to delete team"})
  }
}




export const getTeamsTest = async (req, res) => {
  try {
    const teams = await Team.findAll({
      attributes: ['id', 'name', 'leagueId', 'wins', 'losses'],
    });

    res.status(200).json({ message: "Teams fetched successfully", teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};

export const getTeamPublic = async (req, res) => {
  const { id } = req.params;
  const domain = req.query.domain;

  try {
    if (!domain) return res.status(400).json({ message: "Domain is required" });

    const user = await User.findOne({ where: { domain } });
    if (!user) return res.status(404).json({ message: "No user found for this domain" });

    const team = await Team.findOne({
      where: { id, userId: user.id },
      attributes: ['id', 'name'],
      include: [
        {
          model: Player,
          as: 'players',
          attributes: ['id', 'firstName'],
          include: [
            {
              model: PlayerAttributeValue,
              as: 'attributeValues',
              attributes: ['value'],
              include: [
                {
                  model: PlayerAttribute,
                  as: 'attribute',
                  attributes: ['attribute_name']
                }
              ]
            }
          ]
        },
        {
          model: Game,
          as: 'homeGames',
          attributes: ['id', 'date', 'score_team1', 'score_team2'],
          include: [
            { model: Team, as: 'homeTeam', attributes: ['name'] },
            { model: Team, as: 'awayTeam', attributes: ['name'] }
          ]
        },
        {
          model: Game,
          as: 'awayGames',
          attributes: ['id', 'date', 'score_team1', 'score_team2'],
          include: [
            { model: Team, as: 'homeTeam', attributes: ['name'] },
            { model: Team, as: 'awayTeam', attributes: ['name'] }
          ]
        }
      ]
    });

    if (!team) return res.status(404).json({ message: "Team not found" });

    const games = [...team.homeGames, ...team.awayGames].map((game) => ({
      id: game.id,
      date: game.date,
      score_team1: game.score_team1,
      score_team2: game.score_team2,
      team1: game.homeTeam?.name || "Unknown",
      team2: game.awayTeam?.name || "Unknown",
    }));

    res.status(200).json({
      message: "Team fetched successfully",
      team: {
        id: team.id,
        name: team.name,
        players: team.players,
        games,
      },
    });
  } catch (error) {
    console.error("Error fetching public team:", error);
    res.status(500).json({ message: "Failed to fetch team" });
  }
};




