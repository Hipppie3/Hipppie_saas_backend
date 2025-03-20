import express from 'express';
import {getLeaguesAndTeams} from '../controllers/leagueTeamsController.js';

const router = express.Router();

router.get('/', getLeaguesAndTeams)

export default router;