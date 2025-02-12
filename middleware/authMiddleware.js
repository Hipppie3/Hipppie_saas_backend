export const authenticateSession = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized. Please log in' })
  }

  req.user = req.session.user; // Attach user data to request
  next();
};

