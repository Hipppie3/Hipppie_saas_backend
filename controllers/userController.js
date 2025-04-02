import { User, Sport, Season, League, Team, Player, Game } from '../models/index.js'
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

// Register User
export const registerUser = async (req, res) => {
  const { username, email, password, domain, sportIds, role, slug } = req.body;
  const saltRounds = 10;

  try {
    const normalizedDomain = domain ? domain.trim().toLowerCase() : null;
    const normalizedSlug = slug ? slug.trim().toLowerCase() : null;
    const normalizedEmail = email && email.trim() !== "" ? email.toLowerCase() : null;
    const hashedPassword = password ? await bcrypt.hash(password, saltRounds) : null;

    const userNameExists = await User.findOne({ where: { username } });
    if (userNameExists) {
      return res.status(403).json({ error: 'Username already exists' });
    }

    if (normalizedEmail) {
      const emailExists = await User.findOne({ where: { email: normalizedEmail } });
      if (emailExists) {
        return res.status(403).json({ error: 'Email already registered' });
      }
    }

    if (normalizedSlug) {
      const slugExists = await User.findOne({ where: { slug: normalizedSlug } });
      if (slugExists) {
        return res.status(403).json({ error: 'Slug already in use' });
      }
    }

    const newUser = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      domain: normalizedDomain,
      slug: normalizedSlug,
      role
    });

    if (sportIds && sportIds.length > 0) {
      const sports = await Sport.findAll({ where: { id: sportIds } });
      await newUser.setSports(sports);
    }

    const userWithSports = await User.findByPk(newUser.id, {
      include: { model: Sport, as: "sports" },
    });

    res.status(201).json({
      message: "Registration successful",
      success: true,
      user: userWithSports,
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};





//Login User

export const loginUser = async (req, res) => {
  const { username, password, domain, slug } = req.body;

  try {
    const whereCondition = { username };
    let domainFromHost = req.hostname?.toLowerCase();

    // Normalize domain if 'www.' is included
    if (domainFromHost && domainFromHost.startsWith('www.')) {
      domainFromHost = domainFromHost.slice(4);  // Strip 'www.'
    }

    console.log("Domain from Host:", domainFromHost); // Log this to check what domain is being passed

    if (domain !== undefined) {
      // Normalize the domain passed in the request
      const normalizedDomain = domain.startsWith('www.') ? domain.slice(4) : domain;
      whereCondition.domain = normalizedDomain;
    } else if (slug !== undefined) {
      whereCondition.slug = slug;
    } else {
      // Allow fallback for super_admin logins with no domain
      whereCondition[Op.or] = [
        { domain: domainFromHost },
        { domain: null }  // Allow super_admin to login without domain
      ];
    }

    // Find the user based on the where condition
    const user = await User.findOne({ where: whereCondition });

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // If user has no password (e.g., super_admin or custom login), allow login
    if (!user.password) {
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
        domain: user.domain,
        slug: user.slug,
        theme: user.theme,
      };
      return res.status(200).json({ message: 'Login successful (no password required)', user: req.session.user });
    }

    // Check if password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Set the session with user details
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      domain: user.domain,
      slug: user.slug,
      theme: user.theme,
    };

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
export const checkAuth = async (req, res) => {
  console.log("Checking session:", req.session.user);
  
  if (!req.session.user) {
    return res.json({ authenticated: false, user: null });
  }

  try {
    // Fetch user along with their sports (through the user_sports join table)
    const user = await User.findOne({
      where: { id: req.session.user.id },
      include: [
        {
          model: Sport,
          as: 'sports', // Alias from associations
          attributes: ['id', 'name'],
          through: { attributes: [] }, // Exclude extra join table fields
        }
      ]
    });

    if (!user) {
      return res.json({ authenticated: false, user: null });
    }

    console.log("User sports:", user.sports); // This will log sports associated with the user

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        domain: user.domain,
        slug: user.slug,
        theme: user.theme,
        sports: user.sports, // Include sports in the response
        ...(user.role === 'super_admin' && { role: user.role }), // Include role only if super_admin
      }
    });

  } catch (error) {
    console.error("Error checking auth:", error);
    res.status(500).json({ authenticated: false, message: "Internal server error" });
  }
};




// Update User
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    username,
    oldPassword,
    newPassword,
    email,
    domain,
    slug,
    removePassword,
    theme,
    sportIds
  } = req.body;

  const requestingUser = req.user;

  try {
    const user = await User.findByPk(id, { include: { model: Sport, as: "sports" } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isSuper = requestingUser.role === 'super_admin';
    const isSelf = requestingUser.id === user.id;

    if (!isSuper && !isSelf) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    // ✅ Shared validations (allowed for both super_admin and self)
    if (isSuper || isSelf) {
      if ((username && username !== user.username) || (email && email !== user.email)) {
        if (username && username !== user.username) {
          const existingUser = await User.findOne({ where: { username } });
          if (existingUser) return res.status(400).json({ error: 'Username already taken' });
        }

        if (email && email !== user.email) {
          const updatedEmail = email.trim() === "" ? null : email.toLowerCase();
          const existingEmail = await User.findOne({ where: { email: updatedEmail } });
          if (existingEmail) return res.status(400).json({ error: 'Email already registered' });
        }
      }

      await user.update({
        username: username || user.username,
        email: email ? email.trim().toLowerCase() : user.email,
        theme: theme || user.theme,
      });
    }

    // ✅ Super admin-only updates for domain and slug
    if (isSuper) {
      const normalizedDomain =
        domain === "" ? null :
        domain ? domain.trim().toLowerCase() : user.domain;

      const normalizedSlug =
        slug === "" ? null :
        slug ? slug.trim().toLowerCase() : user.slug;

      if (normalizedDomain && normalizedDomain !== user.domain) {
        const existingDomain = await User.findOne({ where: { domain: normalizedDomain } });
        if (existingDomain) return res.status(400).json({ error: 'Domain already in use' });
      }

      if (normalizedSlug && normalizedSlug !== user.slug) {
        const existingSlug = await User.findOne({ where: { slug: normalizedSlug } });
        if (existingSlug) return res.status(400).json({ error: 'Slug already in use' });
      }

      await user.update({
        domain: normalizedDomain,
        slug: normalizedSlug,
      });
    }

    // ✅ Password update logic (any user)
    let hashedPassword = user.password;
    if (removePassword) {
      hashedPassword = null;
    } else if (newPassword) {
      if (user.password) {
        if (!oldPassword) {
          return res.status(400).json({ error: 'Current password is required to change password' });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ error: 'Incorrect current password' });
        }
      }
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    await user.update({
      password: removePassword ? null : hashedPassword,
    });

    // ✅ Update sports if provided (super admin only)
    if (isSuper && sportIds && sportIds.length > 0) {
      await user.setSports([]);
      const newSports = await Sport.findAll({ where: { id: sportIds } });
      await user.addSports(newSports);
    }

    const updatedUser = await User.findByPk(id, {
      include: { model: Sport, as: "sports" }
    });

    res.status(200).json({
      message: 'User updated successfully',
      success: true,
      user: updatedUser,
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
    if (requestingUser.id === user.id) {
      return res.status(403).json({ error: 'You cannot delete your own account' });
    }
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
  console.log('fetching');
  const requestingUser = req.user;
  console.log(requestingUser);
  if (requestingUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only super admin can view users' });
  }
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      include: { model: Sport, as: "sports" } // ✅ Ensure sports are fetched
    });
    res.status(200).json({
      message: 'Users fetched successfully',
      users: users.length ? users : [],
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};




// Get User By ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  const requestingUser = req.user;

  // Check if the requesting user is trying to fetch their own data or is a super_admin
  if (requestingUser.role !== 'super_admin' && requestingUser.id !== Number(id)) {
    return res.status(403).json({ error: 'You are not authorized to view this user' });
  }

  try {
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'email', 'domain', 'slug', 'theme'], // Exclude password
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      message: 'User fetched successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        domain: user.domain,
        slug: user.slug,
        theme: user.theme,
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};





// Get Users Website
export const getUserWebsites = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'username', 'domain', 'slug'] });
    res.status(200).json({
      message: 'Websites fetched successfully',
      users: users.length ? users : []
    });
  } catch (error) {
    console.error('Error fetching websites:', error);
    res.status(500).json({ error: 'Failed to fetch websites' });
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
      user: { id: user.id, username: user.username, email: user.email, domain: user.domain, theme: user.theme }
    });
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET /api/users/slug/:slug
export const getUserBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const user = await User.findOne({ where: { slug } });
    if (!user) return res.status(404).json({ message: "Site not found" });

    res.status(200).json({ user });
  } catch (error) {
    console.error("Slug lookup failed:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.session.user?.id;
    console.log(userId)
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

 const [
  seasonCount,
  leagueCount,
  teamCount,
  playerCount,
  gameCount,
] = await Promise.all([
  Season.count({ where: { userId } }),
  League.count({ where: { userId } }),
  Team.count({ where: { userId } }),
  Player.count({ where: { userId } }),
  Game.count({ where: { userId } }),
]);

    res.json({ seasonCount, leagueCount, teamCount, playerCount, gameCount });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};