import User from '../models/user.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

// Register User
export const registerUser = async (req, res) => {
  const { username, email, password, role, domain } = req.body;
  const saltRounds = 10;

  try {
    // Normalize domain (lowercase) and ensure email/password can be empty
    const normalizedDomain = domain ? domain.toLowerCase() : null;
    const normalizedEmail = email && email.trim() !== "" ? email.toLowerCase() : null;
    const hashedPassword = password ? await bcrypt.hash(password, saltRounds) : null;
    // Check if a super admin already exists
    const superAdminExists = await User.findOne({ where: { role: 'super_admin' } });
    if (role === 'super_admin' && superAdminExists) {
      return res.status(403).json({ error: 'A super admin already exists. Only an existing super admin can create another.' });
    }
    // Check if username already exists
    const userNameExists = await User.findOne({ where: { username } });
    if (userNameExists) {
      return res.status(403).json({ error: 'Username already exists' });
    }
    // Check if email already exists but only if email is provided
    if (normalizedEmail) {
      const emailExists = await User.findOne({ where: { email: normalizedEmail } });
      if (emailExists) {
        return res.status(403).json({ error: 'Email already registered' });
      }
    }
    // Create the new user
    const newUser = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword, // Password can be null
      role: role || 'client_admin', // Default to client_admin if not provided
      domain: normalizedDomain,
    });
    res.status(201).json({ 
      message: 'Registration successful', 
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        role: newUser.role,
        domain: newUser.domain 
      } 
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

//Login User
export const loginUser = async (req, res) => {
  const { username, password, domain } = req.body;
  try {
    const whereCondition = { username };
    if (domain) {
      whereCondition.domain = domain; 
    } else {
      whereCondition.domain = { [Op.or]: [null, ""] }; // ✅ Allow users with NULL or empty domain
    }
  const user = await User.findOne({ where: whereCondition });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    // ✅ If the user has no password set, allow login
    if (!user.password) {
      req.session.user = { id: user.id, username: user.username, role: user.role, domain: user.domain };
      return res.status(200).json({ message: 'Login successful (no password required)', user: req.session.user });
    }
    // ✅ If a password is set, validate it
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    req.session.user = { id: user.id, username: user.username, role: user.role, domain: user.domain };
    res.status(200).json({ message: 'Login successful', user: req.session.user });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//Logout User
export const logoutUser = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  const {domain} = req.session.user;

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid').status(200).json({ message: 'Logged out successfully', domain });
  });
};

// Check Authentication
export const checkAuth = (req, res) => {
  console.log("Checking session:", req.session.user); // ✅ Debugging
  
  if (req.session.user) {
    return res.json({ 
      authenticated: true, 
      user: { 
        id: req.session.user.id, 
        username: req.session.user.username, 
        role: req.session.user.role, 
        domain: req.session.user.domain 
      }
    });
  }
  res.json({ authenticated: false, user: null });
};

// Update User
export const updateUser = async (req, res) => {
  const { id } = req.params; // The user being updated
  const { username, oldPassword, newPassword, email, domain } = req.body;
  const requestingUser = req.user; // The logged-in user
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // ✅ Regular users can only update their own profile
    if (requestingUser.role !== 'super_admin' && requestingUser.id !== user.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }
    // ✅ Check if username is unique (only if changed)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) return res.status(400).json({ error: 'Username already taken' });
    }
    // ✅ Check if email is unique (only if changed)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) return res.status(400).json({ error: 'Email already registered' });
    }
    // ✅ If updating domain, ensure it's unique
    const normalizedDomain = domain ? domain.toLowerCase() : user.domain;
    if (domain && domain !== user.domain) {
      const existingDomain = await User.findOne({ where: { domain: normalizedDomain } });
      if (existingDomain) return res.status(400).json({ error: 'Domain already in use' });
    }
    // ✅ Regular users must provide old password to update password
    let hashedPassword;
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password' });
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }
    // ✅ Super Admins can update any user, but CANNOT change passwords unless provided
    await user.update({
      username: username || user.username,
      password: hashedPassword || user.password,
      email: email !== undefined && email.trim() === "" ? null : email,
      domain: domain !== undefined && domain.trim() === "" ? null : normalizedDomain,
    });
    // ✅ If the logged-in user is updating their own profile, update session
    if (requestingUser.id === user.id) {
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        domain: user.domain,
      };
    }
    res.status(200).json({
      message: 'User updated successfully',
      success: true,
      user: { id: user.id, username: user.username, email: user.email, domain: user.domain },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Failed to update user' });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;
  // Only super admin can delete users
  if (requestingUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admin can delete users' });
  }
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Prevent deleting self
    if (requestingUser.id === user.id) {
      return res.status(403).json({ error: 'You cannot delete your own account' });
    }
    // Prevent deleting the last super admin
    const superAdminCount = await User.count({ where: { role: 'super_admin' } });
    if (user.role === 'super_admin' && superAdminCount === 1) {
      return res.status(403).json({ error: 'Cannot delete the last super admin' });
    }
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// Get all Users
export const getUsers = async (req, res) => {
  console.log('fetching')
  const requestingUser = req.user;
  console.log(requestingUser)
  if (requestingUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admin can view users' });
  }
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // Exclude password for security
    });
    res.status(200).json({ 
      message: 'Users fetched successfully', 
      users: users.length ? users : []
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};



// Get Users Website
export const getUserWebsites = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'domain'] });
    res.status(200).json({
      message: 'Websites fetched successfully',
      users: users.length ? users : []
    });
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ error: 'Failed to fetch websites' });
  }
};

// Get User By ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;
  if (requestingUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admin can view the user' });
  }
  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'role', 'domain'], // Exclude password
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User fetched successfully', user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};


// Test Custom Domain
export const getDomain = async (req, res) => {
  console.log('Incoming domain request:', req.params.customDomain);
  let customDomain = req.params.customDomain.toLowerCase();
  if (!customDomain.endsWith('.com') && !customDomain.endsWith('.net')) {
    customDomain += '.com';
  }
  try {
    console.log('Looking for domain:', customDomain);
    const user = await User.findOne({ where: { domain: customDomain } });
    if (!user) {
      console.log('Domain not found:', customDomain);
      return res.status(404).json({ message: "Site not found" });
    }
    console.log('Domain found:', user);
    res.status(200).json({ 
      message: 'Domain fetched successfully',
      user: { id: user.id, username: user.username, email: user.email, domain: user.domain }
    });
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};









