import express from 'express';
import { registerUser, getUsers, loginUser, deleteUser } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser); // ✅ Changed to POST
router.get('/', authenticateToken, getUsers); // Protected route
router.delete('/:id', authenticateToken, deleteUser);

export default router;
