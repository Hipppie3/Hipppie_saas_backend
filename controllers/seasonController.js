import { Season, League } from '../models/index.js';

// Create Season
export const createSeason = async (req, res) => {
  const { name, startDate, finishDate, isActive, isVisible } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Season name required' });
  }
  
  try {
    const newSeason = await Season.create({
      name,
      startDate,
      finishDate,
      isActive: isActive || true,
      isVisible: isVisible || true,
      userId: req.user.id,  // Using the logged-in user's ID
    });
    res.status(201).json({ message: 'Season created successfully', season: newSeason });
  } catch (error) {
    console.error("Error creating season:", error);
    res.status(500).json({ message: 'Internal server error creating season' });
  }
};

// Get All Seasons for the Logged-in User
export const getSeasons = async (req, res) => {
  try {
    const seasons = await Season.findAll({
      where: { userId: req.user.id },
      include: [{ model: League, as: 'leagues' }],
    });
    res.status(200).json({ seasons });
  } catch (error) {
    console.error("Error fetching seasons:", error);
    res.status(500).json({ message: "Failed to fetch seasons" });
  }
};

// Update Season
export const updateSeason = async (req, res) => {
  const { id } = req.params;
  const { name, startDate, finishDate, isActive, isVisible } = req.body;

  try {
    const season = await Season.findByPk(id);
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }
    
    // Ensure the user can update this season
    if (season.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await season.update({
      name: name || season.name,
      startDate: startDate || season.startDate,
      finishDate: finishDate || season.finishDate,
      isActive: isActive !== undefined ? isActive : season.isActive,
      isVisible: isVisible !== undefined ? isVisible : season.isVisible,
    });

    res.status(200).json({ message: "Season updated successfully", season });
  } catch (error) {
    console.error("Error updating season:", error);
    res.status(500).json({ message: "Failed to update season" });
  }
};

// Delete Season
export const deleteSeason = async (req, res) => {
  const { id } = req.params;

  try {
    const season = await Season.findByPk(id);
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    // Ensure the user can delete this season
    if (season.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await season.destroy();
    res.status(200).json({ message: "Season deleted successfully" });
  } catch (error) {
    console.error("Error deleting season:", error);
    res.status(500).json({ message: "Failed to delete season" });
  }
};
