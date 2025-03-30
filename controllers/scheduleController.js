import { Schedule, League, Team, Game } from '../models/index.js';
import { Op } from 'sequelize';

// ✅ CREATE a schedule
export const createSchedule = async (req, res) => {
  try {
    const { name, leagueId, startDate, numWeeks, gameDays, sameSlot, timeSlots, weeklyTimeSlots, weeklyDates } = req.body;

    // Ensure that both timeSlots and weeklyTimeSlots are provided correctly based on sameSlot flag
    if (sameSlot && !timeSlots) {
      return res.status(400).json({ message: 'Time slots must be provided when sameSlot is true.' });
    }

    if (!sameSlot && !weeklyTimeSlots) {
      return res.status(400).json({ message: 'Weekly time slots must be provided when sameSlot is false.' });
    }

    // Create the schedule in the database
    const schedule = await Schedule.create({
      name,
      leagueId,
      startDate,
      numWeeks,
      gameDays,
      sameSlot,
      weeklyDates,
      timeSlots: sameSlot ? timeSlots : null,
      weeklyTimeSlots: !sameSlot ? weeklyTimeSlots : null,
    });

    res.status(201).json({ schedule });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Failed to create schedule' });
  }
};


// ✅ GET all schedules
export const getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      include: { model: League, as: 'league' },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Failed to fetch schedules' });
  }
};

// ✅ GET one schedule by ID
export const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id, {
      include: { model: League, as: 'league' },
    });
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.status(200).json({ schedule });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ message: 'Failed to fetch schedule' });
  }
};

// ✅ UPDATE a schedule
export const updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const { sameSlot, timeSlots, weeklyTimeSlots, weeklyDates } = req.body;

    // Optional validation
    if (sameSlot && !timeSlots) {
      return res.status(400).json({ message: 'Time slots must be provided when sameSlot is true.' });
    }
    if (!sameSlot && !weeklyTimeSlots) {
      return res.status(400).json({ message: 'Weekly time slots must be provided when sameSlot is false.' });
    }

    await schedule.update({
  ...req.body,
  weeklyDates: req.body.weeklyDates, // make sure this line exists
  timeSlots: sameSlot ? timeSlots : schedule.timeSlots,
  weeklyTimeSlots: !sameSlot ? weeklyTimeSlots : schedule.weeklyTimeSlots,
});


    res.status(200).json({ schedule });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ message: 'Failed to update schedule' });
  }
};



// ✅ DELETE a schedule
export const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    await schedule.destroy();
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Failed to delete schedule' });
  }
};










export const generateGamesForSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;

    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const teams = await Team.findAll({ where: { leagueId: schedule.leagueId } });
    const teamIds = teams.map(t => t.id);

    const weeklyDates = schedule.weeklyDates || [];
    const timeSlots = schedule.timeSlots || [];

    if (weeklyDates.length !== schedule.numWeeks || timeSlots.length === 0) {
      return res.status(400).json({ message: 'Schedule must have weekly dates and time slots' });
    }

    const gamesToCreate = [];

    for (let week = 0; week < schedule.numWeeks; week++) {
      const weekDate = new Date(weeklyDates[week]);

      const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
      const playingTeams = shuffled.slice(0, 8); // 4 matchups
      const shuffledMatchups = [...playingTeams].sort(() => Math.random() - 0.5);

      for (let i = 0; i < 4; i++) {
        const team1 = shuffledMatchups[i * 2];
        const team2 = shuffledMatchups[i * 2 + 1];

        gamesToCreate.push({
          scheduleId: schedule.id,
          leagueId: schedule.leagueId,
          date: weekDate,
          time: timeSlots[i] || '18:00',
          team1_id: team1,
          team2_id: team2,
          status: 'scheduled',
          weekIndex: week,
        });
      }
    }

    await Game.destroy({ where: { scheduleId } });
    await Game.bulkCreate(gamesToCreate);

    res.status(201).json({ message: 'Games generated successfully', games: gamesToCreate });
  } catch (error) {
    console.error('Error generating games:', error);
    res.status(500).json({ message: 'Failed to generate games' });
  }
};
