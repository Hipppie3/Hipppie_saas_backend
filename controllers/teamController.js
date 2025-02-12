import { League, Team } from '../models/index.js'


// Create Team
export const createTeam = async (req, res) => {
 const {name} = req.body;
 const {id} = req.params;
 if (!name) {
  return res.status(401).json({ message: 'Team name required' })
 };
 try {
  if (!req.user || !req.user.id) {
   return res.status(401).json({ message: 'Unauthorized: No user session' });
  };
  const league = await League.findOne({ where: { id, userId: req.user.id }});
  if (!league) {
   return res.status(403).json({ message: "You don't have permission to add team to this league" })
  }
  const newTeam = await Team.create({
   name,
   userId: req.user.id,
   leagueId: id,
  });
  res.status(201).json({
   message: 'Team created successfully',
   team: newTeam
  });
 } catch (error) {
  console.error({ message: 'Error creating team:', error });
  res.status(500).json({ message: 'Internal server error creating team' })
 }
};

// Get All Teams
export const getTeams = async (req, res) => {
 try {
  const teams = await Team.findAll({ where: { 
   userId: req.user.id,
  }});
  const leagues = await League.findAll({ where: {
   userId: req.user.id,
  }});
  if (leagues.length === 0) {
   return res.status(404).json({ message: 'No leagues found'})
  };
  if (teams.length === 0) {
   return res.status(404).json({ message: 'No teams found'});
  };
  res.status(200).json({ message: 'Teams fetched successfully', teams, leagues})
 } catch (error) {
  console.error("Error fetching teams:", error);
  res.status(500).json({ message: "Failed to fetch teams" })
 }
};

// Get Team By ID
export const getTeamById = async (req, res) => {
 const {id} = req.params;
 try {
  const teams = await Team.findAll({});
  if (!teams) {
   return res.status(404).json({ message: 'No Teams found'})
  };
  res.status(200).json({ message: 'Team fetched successfully', teams})
 } catch (error) {
  console.error("Error fetching teams:", error);
  res.status(500).json({ message: "Failed to fetch teams"})
 }
}

// Get Team By League 
export const getTeamsByLeague = async (req, res) => {
 const {id} = req.params;
 try {
  const teams = await Team.findAll({ 
   where: { 
    userId: req.user.id,
    leagueId: id
   }
  });
  if (teams.length === 0) {
   return res.status(404).json({ message: 'No teams found'});
  }
  res.status(200).json({ message: 'Teams fetched successfully', teams})
 } catch (error) {
  console.error("Error fetching teams:", error);
  res.status(500).json({ message: "Failed to fetch teams" })
 }
};




