import express from 'express';
import { 
  getUserWebsites, getDomain, registerUser, getUsers, loginUser, 
  getUserById, updateUser, deleteUser, logoutUser, checkAuth 
} from '../controllers/userController.js';
import { authenticateSession } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Public domain lookup routes (Moved to the top)
router.get('/', getUserWebsites);
router.get('/domain/:customDomain', getDomain);

// ✅ Authentication-related routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authenticateSession, logoutUser);
router.get('/check-auth', authenticateSession, checkAuth);

// ✅ User-related routes (Super admin protected)
router.get('/userList', authenticateSession, getUsers); 
router.get('/:id', authenticateSession, getUserById);
router.patch('/:id', authenticateSession, updateUser);
router.delete('/:id', authenticateSession, deleteUser);

export default router;
