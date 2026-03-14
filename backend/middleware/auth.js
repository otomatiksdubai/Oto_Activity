const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.userId = decoded.userId;
      req.role = decoded.role;
      req.username = decoded.username;
      return next();
    } catch (error) {
      // If token is invalid, fall back to session or error
    }
  }

  if (req.session && req.session.userId) {
    req.userId = req.session.userId;
    req.role = req.session.role;
    req.username = req.session.username;
    return next();
  }

  return res.status(401).json({ message: 'Unauthorized' });
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

module.exports = { authMiddleware, requireRole };
