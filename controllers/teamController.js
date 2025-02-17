import { League, Team, Player, User } from '../models/index.js'


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
  let teams;
  const userId = req.session?.user?.id;
  const domain = req.query.domain;
  const isSuperAdmin = req.session?.user?.role === "super_admin";

  if (isSuperAdmin) {
    teams = await Team.findAll({ include: [
    { model: League, as: 'league' },  // ✅ Now it correctly fetches the league
    { model: Player, as: 'players' }  // ✅ Now it correctly fetches players
  ] });
  } else if (userId) {
    teams = await Team.findAll({
      where: {userId},
      include: [
    { model: League, as: 'league' },  // ✅ Now it correctly fetches the league
    { model: Player, as: 'players' }  // ✅ Now it correctly fetches players
  ]
    });
  } else if (domain) {
    const user = await User.findOne({ where: {domain}})
    if (!user) {
      return res.status(404).json({ message: "No Teams found for this domain" });
    }
    teams = await Team.findAll({ 
      where: { userId: user.id },
      include: [
    { model: League, as: 'league' },  // ✅ Now it correctly fetches the league
    { model: Player, as: 'players' }  // ✅ Now it correctly fetches players
  ]
    });
  } else {
    return res.status(403).json({ message: "Unauthorized or no teams available" });
  }
  res.status(200).json({
    message: teams.length ? "Teams fetched successfully" : "No teams found",
    teams
  });
} catch (error) {
  console.error("Error fetching teams:", error);
  res.status(505).json({ message: "Failed to fetch teams" });
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
  if (isSuperAdmin) {
    team = await Team.findByPk(id, { include: [
    { model: League, as: 'league' },  // ✅ Now it correctly fetches the league
    { model: Player, as: 'players' }  // ✅ Now it correctly fetches players
  ] });
  } else if (userId) {
    team = await Team.findOne({ where: {id, userId}, include: [
    { model: League, as: 'league' },  // ✅ Now it correctly fetches the league
    { model: Player, as: 'players' }  // ✅ Now it correctly fetches players
  ]});
  } else if (domain) {
    const user = await User.findOne({ where: { domain }});
    if (!user) {
      return res.status(404).json({ message: "No teams found for this domain" });
    }
    team = await Team.findOne({ where: { id, userId: user.id }, include: [
    { model: League, as: 'league' },  // ✅ Now it correctly fetches the league
    { model: Player, as: 'players' }  // ✅ Now it correctly fetches players
  ]})
  } else {
    return res.status(403).json({ message: "Unauthorized" });
  }
  if (!team) {
    res.status(404).json({ message: "Team not fuond"});
  }
  res.status(200).json({ message: "Team fetched successfully", team});
  } catch (error) {
  console.error("Error fetching teams:", error);
  res.status(500).json({ message: "Failed to fetch teams"})
  }
}

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
      name,
      leagueId
    })
    res.status(201).json({ message: "Team updated successfully", team})
  } catch (error) {
    console.error("Error updating team:", error)
    res.status(500).json({ message: "Failed to update team"})
  }
}


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


