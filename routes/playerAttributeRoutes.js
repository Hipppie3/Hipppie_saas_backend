import express from 'express';
import { createPlayerAttribute, getPlayerAttributes, resetPlayerAttributes, togglePlayerAttributeVisibility,  } from '../controllers/playerAttributeController.js';

import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/', authenticateSession, getPlayerAttributes);
router.post('/', authenticateSession, createPlayerAttribute);
router.post('/reset', authenticateSession, resetPlayerAttributes);
router.put('/:id/toggleAttributeVisibility', authenticateSession, togglePlayerAttributeVisibility)



export default router;
