import {Sport, User, Stat} from '../models/index.js'


export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Fetch the user with their associated sports
    const user = await User.findByPk(userId, {
      include: [{ model: Sport, as: "sports", include: [{ model: Stat, as: "stats" }] }],
    });

    if (!user || user.sports.length === 0) {
      return res.status(404).json({ error: "No sport found for this user" });
    }

    // ✅ Extract the stats from the user's first sport
    const stats = user.sports[0].stats;

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


