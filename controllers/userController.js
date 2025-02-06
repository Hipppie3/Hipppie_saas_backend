import User from '../models/user.js';
import bcrypt from 'bcrypt';

// Register User
export const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const saltRounds = 10;

  try {
    const superAdminExists = await User.findOne({ where: { role: 'super_admin' } });
    if (role === 'super_admin' && superAdminExists) {
      return res.status(403).json({ error: 'A super admin already exists. Only an existing super admin can create another.' });
    }

    const userNameExists = await User.findOne({ where: { username } });
    if (userNameExists) {
      return res.status(403).json({ error: 'Username already exists' });
    }
    const emailExists = await User.findOne({ where: { email }});
    if (emailExists) {
      return res.status(403).json({ error: 'Email already registered' })
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

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
  }
};

// Get All Users
export const getUsers = async (req, res) => {
  const requestingUser = req.user;

  if (requestingUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admin can view users' })
  }
  
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
      return res.status(500).json({ message: 'Logout failed' });
    }
    console.log("After logout:", req.session); // ✅ Should be undefined
    res.clearCookie('connect.sid'); // ✅ Clears session cookie
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};


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