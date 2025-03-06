import express from 'express';
import { getUserStats } from '../controllers/statController.js';

const router = express.Router();

router.get('/user/:userId', getUserStats)



export default router;
