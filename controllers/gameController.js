import {Game, Sport, Team, League, Player, User, Stat, PlayerGameStat, GamePeriod, GamePeriodScore, Schedule, Bye} from '../models/index.js';

import { Op } from 'sequelize';



// ✅ Create a new game
export const createGame = async (req, res) => {
  try {
    const { leagueId, team1_id, team2_id, date, status, score_team1, score_team2,  video_url, location, time } = req.body;

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
    res.status(201).json(newGame);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ error: error.message });
  }
};


// ✅ Get all games
export const getGames = async (req, res) => {


  try {
    const { domain, slug } = req.query;
    const userId = req.session?.user?.id;
    const isSuperAdmin = req.session?.user?.role === "super_admin";

    const includeOptions = [
      { model: Team, as: "homeTeam", attributes: ["id", "name"] },
      { model: Team, as: "awayTeam", attributes: ["id", "name"] },
    ];

    let games = [];

    if (isSuperAdmin) {
      games = await Game.findAll({ include: includeOptions });

    } else if (userId) {
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

    } else if (domain || slug) {
      const user = await User.findOne({
        where: domain ? { domain } : { slug },
      });

      if (!user) {
        return res.status(404).json({ message: "No games found for this domain or slug" });
      }

      const leagues = await League.findAll({ where: { userId: user.id } });
      if (!leagues.length) {
        return res.status(404).json({ message: "No leagues found for this user" });
      }

      const leagueIds = leagues.map((league) => league.id);
      games = await Game.findAll({
        where: { leagueId: leagueIds },
        include: includeOptions,
        order: [["date", "ASC"]],
      });

    } else {
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



const generateWeeklyGamesInternal = async ({ scheduleId, weekIndex }) => {
 try {
  if (!scheduleId || weekIndex === undefined) {
    throw new Error('scheduleId and weekIndex are required');
  }

  const schedule = await Schedule.findByPk(scheduleId);
  if (!schedule) {
    throw new Error('Schedule not found');
  }

  const leagueId = schedule.leagueId;
  const teams = await Team.findAll({ where: { leagueId } });
  if (teams.length < 2) {
    throw new Error('Not enough teams to generate games');
  }

    // Remove old games and byes for that week before generating new ones
    await Game.destroy({ where: { scheduleId, weekIndex } });
    await Bye.destroy({ where: { scheduleId, weekIndex } });

    // Fetch all previous byes before the current week
    const previousByes = await Bye.findAll({
      where: {
        scheduleId,
        weekIndex: { [Op.lt]: weekIndex },
      },
    });

    // Count how many byes each team has had
    const byeCounts = {};
    previousByes.forEach((bye) => {
      byeCounts[bye.teamId] = (byeCounts[bye.teamId] || 0) + 1;
    });
// 1. Fetch all previous games in this schedule before the current week
const pastGames = await Game.findAll({
  where: {
    scheduleId,
    weekIndex: { [Op.lt]: weekIndex },
  },
});

// 2. Build a matchup frequency map
const matchupCounts = {};
pastGames.forEach((game) => {
  const [t1, t2] = [game.team1_id, game.team2_id].sort();
  const key = `${t1}-${t2}`;
  matchupCounts[key] = (matchupCounts[key] || 0) + 1;
});



    // Group teams by bye count
    const teamsByByeCount = {};
    teams.forEach((team) => {
      const count = byeCounts[team.id] || 0;
      if (!teamsByByeCount[count]) teamsByByeCount[count] = [];
      teamsByByeCount[count].push(team);
    });

    // Shuffle teams within each bye group
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    };

    const sortedByeCounts = Object.keys(teamsByByeCount).map(Number).sort((a, b) => b - a);
    const prioritizedTeams = [];


    sortedByeCounts.forEach((count) => {
      const group = teamsByByeCount[count];
      shuffle(group);
      prioritizedTeams.push(...group);
    });


    const timeSlots = schedule.timeSlots || [];
    const maxGames = timeSlots.length;

const pairings = [];
const used = new Set();

while (pairings.length < maxGames && prioritizedTeams.length >= 2) {
  let bestPair = null;
  let lowestCount = Infinity;

  for (let i = 0; i < prioritizedTeams.length; i++) {
    const team1 = prioritizedTeams[i];
    if (used.has(team1.id)) continue;

    for (let j = i + 1; j < prioritizedTeams.length; j++) {
      const team2 = prioritizedTeams[j];
      if (used.has(team2.id)) continue;

      const [t1, t2] = [team1.id, team2.id].sort();
      const key = `${t1}-${t2}`;
      const count = matchupCounts[key] || 0;

      if (count < lowestCount) {
        bestPair = [team1, team2];
        lowestCount = count;
      }

      if (count === 0) break; // can't get better than 0
    }

    if (bestPair && lowestCount === 0) break;
  }

  if (bestPair) {
    const [team1, team2] = bestPair;
    pairings.push([team1, team2]);
    used.add(team1.id);
    used.add(team2.id);
  } else {
    break; // no more valid pairs
  }
}
// 🧠 1. Get previous week's byes
let lastWeekByeIds = [];
if (weekIndex > 0) {
  const lastWeekByes = await Bye.findAll({
    where: { scheduleId, weekIndex: weekIndex - 1 },
  });
  lastWeekByeIds = lastWeekByes.map((b) => b.teamId);
}

// 🧹 2. Filter out teams who had a bye last week
const byeTeamsThisWeek = prioritizedTeams.filter(
  (team) => !used.has(team.id) && !lastWeekByeIds.includes(team.id)
);

// 👀 Optional fallback: If all leftover teams had byes last week (rare), allow them
if (byeTeamsThisWeek.length === 0) {
  const allLeftover = prioritizedTeams.filter((team) => !used.has(team.id));
  byeTeamsThisWeek.push(...allLeftover);
}

    console.log(byeTeamsThisWeek)
    if (!schedule.weeklyDates || !schedule.weeklyDates[weekIndex]) {
      return res.status(400).json({ message: 'Missing weekly date for this weekIndex' });
    }

    const gameDate = schedule.weeklyDates[weekIndex];
const gamesToPlay = pairings;

    const games = gamesToPlay.map(([team1, team2], index) => ({
      scheduleId,
      leagueId,
      weekIndex,
      team1_id: team1.id,
      team2_id: team2?.id || null,
      date: gameDate,
      time: timeSlots[index],
      status: 'scheduled',
    }));

    await Game.bulkCreate(games);

    if (byeTeamsThisWeek.length) {
      const byeEntries = byeTeamsThisWeek.map((team) => ({
        scheduleId,
        weekIndex,
        teamId: team.id,
      }));
          console.log(byeEntries)
      await Bye.bulkCreate(byeEntries);
    }

return {
  message: 'Weekly games generated successfully',
  gamesCreated: games.length,
  byesCreated: byeTeamsThisWeek.length,
};

  } catch (error) {
    console.error('Error generating weekly games:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const generateWeeklyGames = async (req, res) => {
  try {
    const { scheduleId, weekIndex } = req.body;
    await generateWeeklyGamesInternal({ scheduleId, weekIndex });
    res.status(201).json({ message: 'Weekly games generated successfully' });
  } catch (error) {
    console.error('Error generating weekly games:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const generateFullSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.body;
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule || !schedule.numWeeks) {
      return res.status(404).json({ message: 'Schedule not found or missing numWeeks' });
    }

    for (let weekIndex = 0; weekIndex < schedule.numWeeks; weekIndex++) {
      await generateWeeklyGamesInternal({ scheduleId, weekIndex });
    }

    res.status(201).json({ message: 'Full schedule generated successfully' });
  } catch (error) {
    console.error('Error generating full schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};







export const getWeeklyGames = async (req, res) => {
  try {
    const { scheduleId, weekIndex } = req.query;

    if (!scheduleId || weekIndex === undefined) {
      return res.status(400).json({ message: 'scheduleId and weekIndex are required' });
    }

    const games = await Game.findAll({
      where: {
        scheduleId,
        weekIndex,
      },
    });

    res.status(200).json({ games });
  } catch (error) {
    console.error('Error fetching weekly games:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// controllers/gameController.js
export const getWeeklyByes = async (req, res) => {
  try {
    const { scheduleId, weekIndex } = req.query;
    if (!scheduleId || weekIndex === undefined) {
      return res.status(400).json({ message: 'scheduleId and weekIndex are required' });
    }

    const byes = await Bye.findAll({
      where: { scheduleId, weekIndex },
    });

    res.status(200).json({ byes });
  } catch (error) {
    console.error('Error fetching byes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// PUT /api/games/swap
export const swapGames = async (req, res) => {
  const { gameId1, gameId2 } = req.body;

  try {
    const game1 = await Game.findByPk(gameId1);
    const game2 = await Game.findByPk(gameId2);

    if (!game1 || !game2) {
      return res.status(404).json({ message: 'One or both games not found' });
    }

    // Swap team IDs
    const tempTeam1 = game1.team1_id;
    const tempTeam2 = game1.team2_id;

    game1.team1_id = game2.team1_id;
    game1.team2_id = game2.team2_id;

    game2.team1_id = tempTeam1;
    game2.team2_id = tempTeam2;

    await game1.save();
    await game2.save();

    res.json({ message: 'Games swapped successfully', game1, game2 });
  } catch (error) {
    console.error('Error swapping games:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
