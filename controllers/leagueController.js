import { League, Team } from '../models/index.js'

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
 console.error({ message: "Error creating league:", error });
 res.status(500).json({ message: 'Internal server error creating league' })
 }
};

// Get All Leagues
export const getLeagues = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: No user session' });
    }

    const leagues = await League.findAll({ 
      where: { userId: req.user.id },
      include: Team
    });

    // ✅ Instead of 404, return an empty array with a success message
    if (leagues.length === 0) {
      return res.status(200).json({ message: 'No leagues found', leagues: [] });
    }

    res.status(200).json({ message: 'Leagues fetched successfully', leagues });
  } catch (error) {
    console.error("Error fetching leagues:", error);
    res.status(500).json({ message: "Failed to fetch leagues" });
  }
};

// Get League By ID
export const getLeagueById = async (req, res) => {
 const {id} = req.params;
console.log("Fetching league with ID:", req.params.id);

 try {
  const league = await League.findByPk(
   id,
   {include: Team
  });
  if (!league) {
   return res.status(404).json({ message: "League not found" })
  };
  res.status(200).json({ message: 'League fetched successfully', league })
 } catch (error) {
 console.error("Error fetching league:", error)
 res.status(500).json({ message: "Failed to fetch league"})
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
  };

  await league.destroy();
  res.status(200).json({ success: true, message: "League deleted successfully" });
 } catch (error) {
  console.error("Error deleting league:", error);
  res.status(500).json({ message: "Failed to delete league" });
 }};