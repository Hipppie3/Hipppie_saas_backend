import express from 'express';
import { getSports, getSportById } from '../controllers/sportController.js';

const router = express.Router();

router.get('/', getSports);
router.get('/:id', getSportById);

export default router;
