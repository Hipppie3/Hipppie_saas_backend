import express from 'express';
import {
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from '../controllers/businessController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllBusinesses);
router.get('/:id', getBusinessById);

// Protected routes — super_admin only
router.post('/', authenticateSession, createBusiness);
router.put('/:id', authenticateSession, updateBusiness);
router.delete('/:id', authenticateSession, deleteBusiness);

export default router;
