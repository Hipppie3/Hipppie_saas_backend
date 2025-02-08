import express from 'express';
import { createLeague, getLeagues }  from '../controllers/leagueController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateSession, getLeagues );
router.post('/', authenticateSession, createLeague);

export default router;