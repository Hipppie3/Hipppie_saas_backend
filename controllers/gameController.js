import {Game, Sport, Team, League, Player, User, Stat, PlayerGameStat, GamePeriod, GamePeriodScore } from '../models/index.js';



// ✅ Create a new game
export const createGame = async (req, res) => {
  try {
    const { leagueId, team1_id, team2_id, date, status, score_team1, score_team2,  video_url, location, time } = req.body;
console.log(leagueId)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: No user session' });
    }
    if (team1_id === team2_id) {
      return res.status(400).json({ error: "Teams must be different" });
    }

    // ✅ Step 1: Create the Game
    const newGame = await Game.create({
      userId: req.user.id,
      leagueId,
      team1_id,
      team2_id,
      date,
      status,
      score_team1: score_team1 || 0,
      score_team2: score_team2 || 0,
      video_url,
      location,
      time
    });


// ✅ Step 2: Find Sport for the user
const user = await User.findByPk(req.user.id, {
  include: [{ model: Sport, as: "sports", through: { attributes: [] } }]
});

const sport = user?.sports?.[0]; // First sport linked to the user

if (!sport) {
  return res.status(400).json({ message: "Sport not found for user" });
}

    console.log(sport)
    res.status(201).json(newGame);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get all games
export const getGames = async (req, res) => {
  console.log("Fetching games");

  try {
    const { domain } = req.query;
    const userId = req.session?.user?.id;
    const isSuperAdmin = req.session?.user?.role === "super_admin";

    const includeOptions = [
      { model: Team, as: "homeTeam", attributes: ["id", "name"] },
      { model: Team, as: "awayTeam", attributes: ["id", "name"] },
    ];

    let games = [];

    if (isSuperAdmin) {
      // ✅ Super Admin: Get all games
      games = await Game.findAll({ include: includeOptions });

    } else if (userId) {
      // ✅ Authenticated User: Fetch games from leagues they are part of
      const user = await User.findByPk(userId, {
        include: [{ model: League, as: "leagues", attributes: ["id"] }],
      });

      if (!user || !user.leagues.length) {
        return res.status(400).json({ error: "User has no associated leagues" });
      }

      const leagueIds = user.leagues.map((league) => league.id);
      games = await Game.findAll({
        where: { leagueId: leagueIds },
        include: includeOptions,
        order: [["date", "ASC"]],
      });

} else if (domain) {
  // ✅ Step 1: Find the user who owns this domain
  const user = await User.findOne({ where: { domain } }); 
  if (!user) {
    return res.status(404).json({ message: "No games found for this domain" });
  }

  // ✅ Step 2: Find leagues that belong to this user
  const leagues = await League.findAll({ where: { userId: user.id } });
  if (!leagues.length) {
    return res.status(404).json({ message: "No leagues found for this domain" });
  }

  // ✅ Step 3: Get games for these leagues
  const leagueIds = leagues.map(league => league.id);
  games = await Game.findAll({
    where: { leagueId: leagueIds }, // Fetch games for all leagues of the user
    include: includeOptions,
    order: [["date", "ASC"]],
  });
}
 else {
      return res.status(403).json({ message: "Unauthorized or no games available" });
    }

    res.status(200).json({
      message: games.length ? "Games fetched successfully" : "No games found",
      games,
    });

  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ message: "Failed to fetch games" });
  }
};



// Get a single game by ID
export const getGameById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Fetch the game with teams and players
    const game = await Game.findByPk(id, {
      include: [
        {
          model: Team,
          as: "homeTeam",
          include: [{ model: Player, as: "players" }],
        },
        {
          model: Team,
          as: "awayTeam",
          include: [{ model: Player, as: "players" }],
        },
        {
          model: GamePeriodScore,
          as: "periodScores",
          include: [{ model: GamePeriod, as: "gamePeriod" }],
        },
      ],
    });

    if (!game) return res.status(404).json({ error: "Game not found" });

    // ✅ Fetch the user and their associated sports
    const user = await User.findByPk(game.userId, {
      include: [{ model: Sport, as: "sports", through: { attributes: [] } }],
    });

    if (!user || !user.sports.length) {
      return res.status(400).json({ error: "User has no associated sport" });
    }

    // ✅ Get sportId from the user's first sport
    const sportId = user.sports[0].id;
    const sport = user.sports[0];

    // ✅ Check if the game already has periodScores
    const existingScores = await GamePeriodScore.findAll({ where: { gameId: id } });

    if (existingScores.length === 0) {
      console.log(`No GamePeriodScores found for game ${id}. Assigning now...`);

      // ✅ Fetch all GamePeriods for this sport & user
      const gamePeriods = await GamePeriod.findAll({
        where: { sportId, userId: game.userId },
      });

      if (gamePeriods.length > 0) {
        // ✅ Assign GamePeriods to the game
        await Promise.all(
          gamePeriods.map((period) =>
            GamePeriodScore.create({
              gameId: id,
              gamePeriodId: period.id,
              period_score_team1: 0,
              period_score_team2: 0,
            })
          )
        );

        console.log(`GamePeriods assigned to game ${id}`);
      } else {
        console.warn(`No game periods found for sportId: ${sportId}`);
      }
    }

    // ✅ Fetch player stats for this game
    const playerStats = await PlayerGameStat.findAll({
      where: { game_id: id },
      include: [{ model: Stat, as: "stat" }],
    });

    // ✅ Fetch all stats for this sport and user
    const stats = await Stat.findAll({ where: { sportId, userId: game.userId } });

    // ✅ Refetch game to include newly added GamePeriodScores
    const updatedGame = await Game.findByPk(id, {
      include: [
        {
          model: Team,
          as: "homeTeam",
          include: [{ model: Player, as: "players" }],
        },
        {
          model: Team,
          as: "awayTeam",
          include: [{ model: Player, as: "players" }],
        },
        {
          model: GamePeriodScore,
          as: "periodScores",
          include: [{ model: GamePeriod, as: "gamePeriod" }],
        },
      ],
    });

    res.status(200).json({ game: updatedGame, stats, playerStats, sport: {id: sport.id, name: sport.name} });
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: error.message });
  }
};




// Update game
export const updateGameScores = async (req, res) => {
  try {
    const { id } = req.params;
    const { score_team1, score_team2 } = req.body;

    const game = await Game.findByPk(id);
    if (!game) return res.status(404).json({ error: "Game not found" });

    game.score_team1 = score_team1;
    game.score_team2 = score_team2;
    game.status = "completed"; // Auto-update status
    await game.save();

    // ✅ Recalculate wins/losses for both teams
    await recalculateTeamRecords(game.team1_id);
    await recalculateTeamRecords(game.team2_id);

    res.status(200).json(game);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Function to Recalculate Team Wins/Losses
const recalculateTeamRecords = async (teamId) => {
  const team = await Team.findByPk(teamId, {
    include: [
      {
        model: Game,
        as: "homeGames",
        where: { status: "completed" },
        required: false,
      },
      {
        model: Game,
        as: "awayGames",
        where: { status: "completed" },
        required: false,
      },
    ],
  });

  if (!team) return;

  let wins = 0, losses = 0, ties = 0;

  // ✅ Count wins/losses/ties from completed home games
  team.homeGames.forEach((game) => {
    if (game.score_team1 > game.score_team2) wins++;
    else if (game.score_team1 < game.score_team2) losses++;
    else ties++;
  });

  // ✅ Count wins/losses/ties from completed away games
  team.awayGames.forEach((game) => {
    if (game.score_team2 > game.score_team1) wins++;
    else if (game.score_team2 < game.score_team1) losses++;
    else ties++;
  });

  // ✅ Update the team's wins/losses
  await team.update({ wins, losses, ties });
};

// Update Game Details
export const updateGameDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { video_url, location, time, status, date } = req.body;

    const game = await Game.findByPk(id);
    if (!game) return res.status(404).json({ error: "Game not found" });

    // Update game details (excluding score)
    game.video_url = video_url !== undefined ? video_url : game.video_url;
    game.location = location !== undefined ? location : game.location;
    game.time = time !== undefined ? time : game.time;
    game.status = status || game.status; // If no status provided, keep the old one
    game.date = date !== undefined ? date : game.date;
    await game.save();

    res.status(200).json(game);
  } catch (error) {
    console.error("Error updating game details:", error);
    res.status(500).json({ error: error.message });
  }
};


// Delete a game
export const deleteGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findByPk(id);
    if (!game) return res.status(404).json({ error: "Game not found" });
    await game.destroy();
    res.status(204).json({ message: "League deleted successfully"});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get Games by league
export const getGamesByLeague = async (req, res) => {
  try {
    const { leagueId } = req.params;
    const games = await Game.findAll({
      where: { leagueId },
      include: [
        { model: Team, as: 'homeTeam', attributes: ['id', 'name'] }, // ✅ Get team 1 name
        { model: Team, as: 'awayTeam', attributes: ['id', 'name'] }, // ✅ Get team 2 name
      ],
    });
    res.json(games);
  } catch (error) {
    console.error('Error fetching games by league:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
};





// Function to generate a league schedule
export const generateLeagueSchedule = async (req, res) => {
  try {
    const { leagueId, startDate, endDate, gameDays } = req.body;
    if (!leagueId || !startDate || !endDate || !gameDays) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    console.log(`Fetching league with ID: ${leagueId}`);
    // Fetch league and get sportId
    const league = await League.findByPk(leagueId);
    if (!league) {
      return res.status(404).json({ message: 'League not found' });
    }
    const sportId = league.sportId;
    console.log(`League found. Sport ID: ${sportId}`);
    if (!sportId) {
      return res.status(400).json({ message: 'League is not associated with a sport' });
    }
    // Fetch teams for this league
    const teams = await Team.findAll({ where: { leagueId } });
    if (teams.length < 2) {
      return res.status(400).json({ message: 'At least 2 teams are required to generate a schedule' });
    }
    if (teams.length % 2 !== 0) {
      // If odd number of teams, add a "bye" team (null) to balance schedule
      teams.push({ id: null, name: "Bye" });
    }
    // Generate available game dates (1 per week)
    const availableDates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= new Date(endDate)) {
      const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(currentDate);
      if (gameDays.includes(weekday)) {
        availableDates.push(currentDate.toISOString().split('T')[0]); // Format YYYY-MM-DD
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    if (availableDates.length < 7) {
      return res.status(400).json({ message: 'Not enough valid game days for a 7-week schedule' });
    }
    // Generate Round-Robin schedule
    const games = [];
    let week = 0;
    // Shuffle teams randomly
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    for (let round = 0; round < 7; round++) {
      for (let i = 0; i < shuffledTeams.length / 2; i++) {
        const team1 = shuffledTeams[i];
        const team2 = shuffledTeams[shuffledTeams.length - 1 - i];
        if (team1.id !== null && team2.id !== null) { // Skip bye weeks
          games.push({
            sportId,
            leagueId,
            team1_id: team1.id,
            team2_id: team2.id,
            date: availableDates[week], // Assign game to a weekly slot
            status: 'scheduled',
          });
        }
      }
      // Rotate teams for the next round (except the first team stays in place)
      shuffledTeams.splice(1, 0, shuffledTeams.pop());
      week++;
    }
    // Bulk insert into games table
    await Game.bulkCreate(games);
    return res.status(201).json({ message: 'Schedule generated successfully', games });
  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getGamesBySchedule = async (req, res) => {
  try {
    const { scheduleId } = req.query;
    if (!scheduleId) {
      return res.status(400).json({ message: "Missing scheduleId" });
    }

    const games = await Game.findAll({
      where: { scheduleId },
      include: [
        { model: Team, as: 'homeTeam', attributes: ['id', 'name'] },
        { model: Team, as: 'awayTeam', attributes: ['id', 'name'] },
      ],
      order: [['weekIndex', 'ASC'], ['time', 'ASC']],
    });

    res.status(200).json({ games });
  } catch (error) {
    console.error('Error fetching games by schedule:', error);
    res.status(500).json({ message: 'Failed to fetch games' });
  }
};

