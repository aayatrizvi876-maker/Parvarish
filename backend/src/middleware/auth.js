const jwt = require('jsonwebtoken');
const constants = require('../config/constants');
const db = require('../db/database');

// Authenticate JWT Token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, constants.JWT_SECRET);
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      return res.status(403).json({ error: 'Your account is suspended or deactivated. Contact HOD office.' });
    }

    req.user = {
      id: user.id,
      googleId: user.google_id,
      name: user.name,
      email: user.email,
      profileImage: user.profile_image,
      role: user.role,
      designation: user.designation,
      department: user.department,
      institution: user.institution,
      isVerified: Boolean(user.is_verified)
    };

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

// Optional Auth (for guest read where token may be present)
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, constants.JWT_SECRET);
      const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [decoded.id]);
      if (user) {
        req.user = {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
          profileImage: user.profile_image
        };
      }
    } catch (e) {
      // Ignore token errors for optional auth
    }
  }
  next();
}

// Role Requirement Guard Middleware
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Forbidden. Action requires one of [${allowedRoles.join(', ')}] role. Current role: ${req.user.role}` 
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole
};
