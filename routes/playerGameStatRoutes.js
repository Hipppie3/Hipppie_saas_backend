import express from "express";
import { updatePlayerStat, getGamePlayerStats } from "../controllers/playerGameStatController.js";

const router = express.Router();

router.put("/", updatePlayerStat); // ✅ Update or Insert a Stat
router.get("/:game_id", getGamePlayerStats); // ✅ Get Stats for a Game

export default router;
