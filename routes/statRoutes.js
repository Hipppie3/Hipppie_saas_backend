import express from 'express';
import { getStatsBySport } from '../controllers/statController.js';

const router = express.Router();

router.get('/:id', getStatsBySport); // Example: /api/stats/Basketball

export default router;
