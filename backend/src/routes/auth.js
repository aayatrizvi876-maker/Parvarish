const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const constants = require('../config/constants');
const { authenticateToken } = require('../middleware/auth');
const { verifyAdminCode } = require('../middleware/adminVerify');

/**
 * Standard Email Format Validator
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

// POST /api/auth/google — Normal Google Login & Account Resolution
router.post('/google', async (req, res) => {
  try {
    const { googleId, name, email, profileImage, roleChoice } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required for authentication.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid Google email address.' });
    }

    const sanitizedId = googleId || `g_${uuidv4().slice(0, 12)}`;

    // Check existing user
    let user = await db.getAsync('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      // Auto-create user profile for Google user
      const newId = 'usr_' + uuidv4().slice(0, 12);
      const role = roleChoice && ['STUDENT', 'FACULTY'].includes(roleChoice) ? roleChoice : 'STUDENT';
      const isVerified = 0;
      const designation = role === 'FACULTY' ? 'Faculty Member' : 'Student';
      const userName = name || normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const avatar = profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

      await db.runAsync(`
        INSERT INTO users (id, google_id, name, email, profile_image, role, designation, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [newId, sanitizedId, userName, normalizedEmail, avatar, role, designation, isVerified]);

      user = await db.getAsync('SELECT * FROM users WHERE id = ?', [newId]);
    } else {
      await db.runAsync(`
        UPDATE users SET last_login_at = CURRENT_TIMESTAMP, profile_image = COALESCE(?, profile_image)
        WHERE id = ?
      `, [profileImage, user.id]);
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      return res.status(403).json({ error: 'Account suspended or deactivated. Please contact HOD Office.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      constants.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profile_image,
        role: user.role,
        designation: user.designation,
        department: user.department,
        institution: user.institution,
        bio: user.bio,
        isVerified: Boolean(user.is_verified)
      }
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Server error during Google Authentication.' });
  }
});

// POST /api/auth/sync-session — Sync Supabase / Google Session with Backend DB
router.post('/sync-session', async (req, res) => {
  try {
    const { email, name, profileImage, supabaseUid } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    let user = await db.getAsync('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      const newId = 'usr_' + uuidv4().slice(0, 12);
      const defaultRole = 'STUDENT';
      const designation = 'Student';
      const userName = name || normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const avatar = profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

      await db.runAsync(`
        INSERT INTO users (id, google_id, name, email, profile_image, role, designation, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newId, 
        supabaseUid || `sp_${uuidv4().slice(0, 10)}`, 
        userName, 
        normalizedEmail, 
        avatar, 
        defaultRole, 
        designation, 
        0
      ]);

      user = await db.getAsync('SELECT * FROM users WHERE id = ?', [newId]);
    } else {
      await db.runAsync(`
        UPDATE users SET last_login_at = CURRENT_TIMESTAMP, profile_image = COALESCE(?, profile_image)
        WHERE id = ?
      `, [profileImage, user.id]);
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      return res.status(403).json({ error: 'Account suspended or deactivated. Please contact HOD Office.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      constants.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Session synced successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profile_image,
        role: user.role,
        designation: user.designation,
        department: user.department,
        institution: user.institution,
        bio: user.bio,
        isVerified: Boolean(user.is_verified)
      }
    });
  } catch (err) {
    console.error('Session sync error:', err);
    res.status(500).json({ error: 'Failed to synchronize authenticated session.' });
  }
});

// POST /api/auth/login — Email Authentication Fallback / Verification
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    let user = await db.getAsync('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      // Auto-create active student user
      const newId = 'usr_' + uuidv4().slice(0, 12);
      const userName = normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`;

      await db.runAsync(`
        INSERT INTO users (id, google_id, name, email, profile_image, role, designation, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [newId, `email_${uuidv4().slice(0, 8)}`, userName, normalizedEmail, avatar, 'STUDENT', 'Student', 0]);

      user = await db.getAsync('SELECT * FROM users WHERE id = ?', [newId]);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      constants.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profile_image,
        role: user.role,
        designation: user.designation,
        department: user.department,
        institution: user.institution,
        bio: user.bio,
        isVerified: Boolean(user.is_verified)
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server authentication error.' });
  }
});

// POST /api/auth/role — Assign Role (Only STUDENT and FACULTY allowed directly)
router.post('/role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['STUDENT', 'FACULTY'].includes(role)) {
      if (role === 'ADMIN') {
        return res.status(403).json({ 
          error: 'Passcode verification is required to access HOD / Admin role. Please verify via the passcode prompt.' 
        });
      }
      return res.status(400).json({ error: 'Invalid role. Must be STUDENT or FACULTY.' });
    }

    const designation = role === 'FACULTY' ? 'Faculty Member' : 'Student';
    const isVerified = 0;
    
    await db.runAsync('UPDATE users SET role = ?, designation = ?, is_verified = ? WHERE id = ?', [role, designation, isVerified, req.user.id]);

    const updatedUser = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const token = jwt.sign({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role }, constants.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      message: 'Role updated successfully',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profile_image,
        role: updatedUser.role,
        designation: updatedUser.designation,
        department: updatedUser.department,
        institution: updatedUser.institution,
        bio: updatedUser.bio,
        isVerified: Boolean(updatedUser.is_verified)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error setting role.' });
  }
});

// POST /api/auth/verify-admin — Server-Side Admin Verification
router.post('/verify-admin', authenticateToken, async (req, res) => {
  try {
    const { verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({ error: 'Passcode is required.' });
    }

    const isValid = verifyAdminCode(verificationCode);

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid passcode. Access denied. Please ensure you have authorized HOD / Admin credentials.'
      });
    }

    await db.runAsync(`
      UPDATE users SET 
        role = 'ADMIN',
        designation = 'Head of Department',
        is_verified = 1
      WHERE id = ?
    `, [req.user.id]);

    const updatedUser = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const token = jwt.sign({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role }, constants.JWT_SECRET, { expiresIn: '30d' });

    await db.runAsync(`
      INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, metadata)
      VALUES (?, ?, 'ADMIN_VERIFICATION_SUCCESS', 'USER', ?, ?)
    `, [uuidv4(), req.user.id, req.user.id, JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'] })]);

    res.json({
      message: 'Verification successful. Administrative access granted.',
      token,
      user: {
        id: updatedUser.id,
        name: updatedUser.name || 'Head of Department',
        email: updatedUser.email,
        profileImage: updatedUser.profile_image,
        role: updatedUser.role,
        designation: updatedUser.designation,
        department: updatedUser.department,
        institution: updatedUser.institution,
        bio: updatedUser.bio,
        isVerified: Boolean(updatedUser.is_verified)
      }
    });
  } catch (err) {
    console.error('Admin verification error:', err);
    res.status(500).json({ error: 'Server error during admin verification.' });
  }
});

// GET /api/auth/me — Get Current Session Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({
      user: {
        id: user.id,
        googleId: user.google_id,
        name: user.role === 'ADMIN' ? 'Head of Department' : user.name,
        email: user.email,
        profileImage: user.profile_image,
        role: user.role,
        designation: user.designation,
        department: user.department,
        institution: user.institution,
        bio: user.bio,
        isVerified: Boolean(user.is_verified),
        status: user.status,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching session user.' });
  }
});

module.exports = router;
