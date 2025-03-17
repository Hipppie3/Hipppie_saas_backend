import { GamePeriodScore, GamePeriod } from "../models/index.js"; // Adjust import paths as needed

export const updatePeriodScores = async (req, res) => {
  try {
    const { game_id, scores } = req.body;
    console.log
    if (!game_id || !Array.isArray(scores)) {
      return res.status(400).json({ error: "Invalid request data" });
    }

    await Promise.all(
      scores.map(async (score) => {
        const periodScore = await GamePeriodScore.findByPk(score.id, {
          include: [{ model: GamePeriod, as: "gamePeriod" }],
        });

        if (!periodScore) {
          throw new Error(`Period score with ID ${score.id} not found`);
        }

        // ✅ Update period score
        await GamePeriodScore.update(
          {
            period_score_team1: score.period_score_team1,
            period_score_team2: score.period_score_team2,
          },
          { where: { id: score.id, gameId: game_id} }
        );
      })
    );

    res.status(200).json({ message: "Period scores updated successfully" });
  } catch (error) {
    console.error("Error updating period scores:", error);
    res.status(500).json({ error: error.message || "Failed to update period scores" });
  }
};
