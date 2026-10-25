const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');

// GET /api/users/:id — Public Profile View
router.get('/users/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    // Dynamic Database Stats
    const followersRow = await db.getAsync('SELECT COUNT(*) as count FROM follows WHERE following_id = ?', [id]);
    const followingRow = await db.getAsync('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?', [id]);
    const postsRow = await db.getAsync("SELECT COUNT(*) as count FROM posts WHERE author_id = ? AND status = 'PUBLISHED'", [id]);
    const isFollowingRow = currentUserId ? await db.getAsync('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?', [currentUserId, id]) : null;

    res.json({
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profile_image,
        role: user.role,
        designation: user.designation,
        department: user.department,
        institution: user.institution,
        bio: user.bio,
        isVerified: Boolean(user.is_verified),
        status: user.status,
        createdAt: user.created_at,
        stats: {
          followersCount: followersRow.count,
          followingCount: followingRow.count,
          postsCount: postsRow.count
        },
        isFollowing: Boolean(isFollowingRow)
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// GET /api/admin/users — Search & Manage Platform Users (ADMIN ONLY)
router.get('/admin/users', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { search, role, status } = req.query;
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];

    if (role && role !== 'ALL') {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (status && status !== 'ALL') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ? OR department LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC';
    const rows = await db.allAsync(sql, params);

    res.json({
      users: rows.map(u => ({
        id: u.id,
        googleId: u.google_id,
        name: u.name,
        email: u.email,
        profileImage: u.profile_image,
        role: u.role,
        designation: u.designation,
        department: u.department,
        institution: u.institution,
        isVerified: Boolean(u.is_verified),
        status: u.status,
        createdAt: u.created_at,
        lastLoginAt: u.last_login_at
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user management list.' });
  }
});

// PATCH /api/admin/users/:id/status — Toggle User Status (ADMIN ONLY)
router.patch('/admin/users/:id/status', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'

    if (!['ACTIVE', 'SUSPENDED', 'DEACTIVATED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }

    await db.runAsync('UPDATE users SET status = ? WHERE id = ?', [status, id]);

    await db.runAsync(`
      INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, metadata)
      VALUES (?, ?, 'CHANGE_USER_STATUS', 'USER', ?, ?)
    `, [uuidv4(), req.user.id, id, JSON.stringify({ status })]);

    res.json({ message: `User status changed to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// PATCH /api/admin/users/:id/role — Change User Role (ADMIN ONLY)
router.patch('/admin/users/:id/role', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['STUDENT', 'FACULTY', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role choice.' });
    }

    const designation = role === 'FACULTY' ? 'Faculty Member' : role === 'ADMIN' ? 'Head of Department' : 'Student';
    const isVerified = role === 'ADMIN' || role === 'FACULTY' ? 1 : 0;

    await db.runAsync('UPDATE users SET role = ?, designation = ?, is_verified = ? WHERE id = ?', [role, designation, isVerified, id]);

    await db.runAsync(`
      INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, metadata)
      VALUES (?, ?, 'CHANGE_USER_ROLE', 'USER', ?, ?)
    `, [uuidv4(), req.user.id, id, JSON.stringify({ role })]);

    res.json({ message: `User role updated to ${role}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

module.exports = router;
