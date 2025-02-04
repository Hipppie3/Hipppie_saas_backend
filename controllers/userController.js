import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/config.js';

const { secret } = jwtConfig;

// Register User
export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const saltRounds = 10;

  try {
    const superAdminExists = await User.findOne({ where: { role: 'super_admin' } });
    if (role === 'super_admin' && superAdminExists) {
      return res.status(403).json({ error: 'Super admin can only be created by an existing super admin' });
    }

    const userNameExists = await User.findOne({ where: { username } });
    if (userNameExists) {
      return res.status(403).json({ error: 'Username already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: newUser.id, username: newUser.username, role: newUser.role }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Get All Users
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role'],
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    res.status(200).json({ 
      message: 'Login successful',
      user: { id: user.id, username: user.username, role: user.role },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;

  if (requestingUser.role !== 'super_admin') {
  return res.status(403).json({ error: 'Only super admin can delete user' })
  } 

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found '});
    }
    // Prevent deleting another super admin (if you ever add more)
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'cannot delete a super admin'})
    }
    
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
