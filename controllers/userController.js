import User from '../models/user.js';
import bcrypt from 'bcrypt';

// Register User
export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const saltRounds = 10;

  try {
    // Check if a super admin already exists
    const superAdminExists = await User.findOne({ where: { role: 'super_admin' } });
      if (role === 'super_admin' && superAdminExists) {
      return res.status(403).json({ error: 'A super admin already exists. Only an existing super admin can create another.' });
    };
    // Check if username or email already exists
    const userNameExists = await User.findOne({ where: { username } });
      if (userNameExists) {
      return res.status(403).json({ error: 'Username already exists' });
    };
    const emailExists = await User.findOne({ where: { email }});
      if (emailExists) {
      return res.status(403).json({ error: 'Email already registered' })
    };
    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });
    //Store user in session
    req.session.user = { 
      id: newUser.id, 
      username: newUser.username, 
      role: newUser.role 
    };
    res.status(201).json({ 
      message: 'Registration successful', 
      user: req.session.user
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Registration failed' });
  };
};

// Get All Users
export const getUsers = async (req, res) => {
  // requestingUser is user data now
  const requestingUser = req.user;

  if (requestingUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admin can view users' })
  };

  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'role', 'domain'],
    });
    res.status(200).json({ 
      message: 'Users fetched successfully', 
      users: users.length ? users : [] })
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
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

// Update User
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, oldPassword, newPassword, email, domain } = req.body;
  const requestingUser = req.user;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (requestingUser.role !== 'super_admin' && requestingUser.id !== user.id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) return res.status(400).json({ error: 'Username already taken' });
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) return res.status(400).json({ error: 'Email already registered' });
    }

    if (oldPassword && !newPassword) {
      return res.status(400).json({ error: 'New password is required when changing password' });
    }

    let hashedPassword;
    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({ error: 'Current password is required to change password' });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect current password. Please enter the correct password to update your account.' });
      }

      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    await user.update({ 
      username: username || user.username,
      password: hashedPassword || user.password,
      email: email || user.email,
      domain: domain || user.domain
    });

    if (requestingUser.id === user.id) { 
      req.session.user = { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        domain: user.domain
      };
    }

    res.status(200).json({ 
      message: 'User updated successfully', 
      user: req.session.user 
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: "Failed to update user" });
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

    if (requestingUser.id = user.id) {
      return res.status(403).json({ error: 'You cannot delete your own account' })
    }
    // Prevent deleting another super admin (if you ever add more)
    if (user.role === 'super_admin') {
      return res.status(403).json({ error: 'Cannot delete a super admin'})
    }
    
    await user.destroy();
    res.status(200).json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

//Login User
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where:  { username }});
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' })
    };
    const isPasswordValid = await bcrypt.compare( password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' })
    };
    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.status(200).json({ message: 'Login successful', user: req.session.user })
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error'})
  }
};

//Logout User
export const logoutUser = async (req, res) => {
  console.log("Before logout:", req.session); // ✅ Check if session exists
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' })
    };
    console.log("After logout:", req.session); // ✅ Should be undefined
    return res.clearCookie('connect.sid').status(200).json({ message: 'Logged out successfully' }); // ✅ Clears session cookie
  });
};

// Check Authentication
export const checkAuth = (req, res) => {
  if (req.session.user) {
    return res.json({ authenticated: true, user: req.session.user });
  }
  res.json({ authenticated: false });
};











// Login User with token
/*export const loginUser = async (req, res) => {
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
      user: payload,
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
*/