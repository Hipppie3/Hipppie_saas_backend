import League from '../models/league.js';

export const createLeague = async (req, res) => {
 const {name} = req.body;
 if (!name) {
  return res.status(401).json({ message: 'League name required '})
 }
 try {
  if (!req.user || !req.user.id) {
   return res.status(401).json({ message: 'Unauthorized: No user session' });
  }
 const newLeague = await League.create({
  name,
  createdBy: req.user.id,
 });
 res.status(200).json({
  message: 'League created successfully', 
  league: newLeague
 });
 } catch (error) {
 console.error({ message: "Error creating league:", error});
 res.status(500).json({ message: 'Internal server error creating league'})
 }
};

export const getLeagues = async (req, res) => {
 try {
  if (!req.user || !req.user.id) {
   return res.status(401).json({ message: 'Unauthorized: No user session' });
  }
  const leagues = await League.findAll({ where: { createdBy: req.user.id },
  });
  if (leagues.length === 0) {
   return res.status(404).json({ message: 'No leagues found'});
  }
  
  res.status(200).json({ message: 'Leagues fetched successfully', leagues });
 } catch (error) {
  console.error("Error fetching leagues:", error);
  res.status(500).json({ message: "Failed to fetch leagues" });
 }
};