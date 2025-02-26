import { League, Team, Player, User } from '../models/index.js'

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
    let leagues;
    const userId = req.session?.user?.id; // ✅ Get user ID if logged in
    const domain = req.query.domain; // ✅ Get domain if public user
    const isSuperAdmin = req.session?.user?.role === "super_admin"; // ✅ Super admin check

    if (isSuperAdmin) {
      leagues = await League.findAll({ include: [
    { model: Team, as: 'teams' },  
  ] });
    } else if (userId) {
      leagues = await League.findAll({ 
        where: { userId }, 
        include: [
    { model: Team, as: 'teams' }, 
  ]
      });
    } else if (domain) {
      const user = await User.findOne({ where: { domain } });
      if (!user) {
        return res.status(404).json({ message: "No leagues found for this domain" });
      }
      leagues = await League.findAll({ 
        where: { userId: user.id }, 
        include: [
    { model: Team, as: 'teams' },  
  ] 
      });
    } else {
      return res.status(403).json({ message: "Unauthorized or no leagues available" });
    }
    res.status(200).json({
      message: leagues.length ? "Leagues fetched successfully" : "No leagues found",
      leagues
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