import express from 'express';
import {createSeason, getSeasons, updateSeason, deleteSeason} from '../controllers/seasonController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateSession, getSeasons),
router.post('/', authenticateSession, createSeason),
router.put('/:id', updateSeason), 
router.delete('/:id', authenticateSession, deleteSeason)

export default router;