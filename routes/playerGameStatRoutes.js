import express from "express";
import { updatePlayerStat, getGamePlayerStats } from "../controllers/playerGameStatController.js";
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

router.put("/", authenticateSession, updatePlayerStat); // ✅ Update or Insert a Stat
router.get("/:game_id", authenticateSession, getGamePlayerStats); // ✅ Get Stats for a Game

export default router;
