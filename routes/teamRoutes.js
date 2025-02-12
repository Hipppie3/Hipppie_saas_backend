import express from 'express';
import { authenticateSession } from '../middleware/authMiddleware.js';
import {getTeams} from '../controllers/teamController.js'


const router = express.Router();

router.get('/', authenticateSession, getTeams)


export default router;