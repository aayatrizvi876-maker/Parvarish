const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// POST /api/users/:id/follow — Follow HOD or Profile
router.post('/users/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const followerId = req.user.id;

    if (targetUserId === followerId) {
      return res.status(400).json({ error: 'You cannot follow yourself.' });
    }

    const targetUser = await db.getAsync('SELECT id, name FROM users WHERE id = ?', [targetUserId]);
    if (!targetUser) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    try {
      await db.runAsync('INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)', [uuidv4(), followerId, targetUserId]);
    } catch (e) {
      // Unique constraint prevents duplicate follow records
      return res.status(400).json({ message: 'Already following user profile.' });
    }

    const countRow = await db.getAsync('SELECT COUNT(*) as count FROM follows WHERE following_id = ?', [targetUserId]);

    res.json({
      message: `Now following ${targetUser.name}`,
      followersCount: countRow.count,
      isFollowing: true
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to follow user.' });
  }
});

// DELETE /api/users/:id/follow — Unfollow Profile
router.delete('/users/:id/follow', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const followerId = req.user.id;

    await db.runAsync('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, targetUserId]);
    const countRow = await db.getAsync('SELECT COUNT(*) as count FROM follows WHERE following_id = ?', [targetUserId]);

    res.json({
      message: 'Unfollowed profile',
      followersCount: countRow.count,
      isFollowing: false
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unfollow user.' });
  }
});

// GET /api/users/:id/followers — Get Followers List & Dynamic Count
router.get('/users/:id/followers', optionalAuth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user ? req.user.id : null;

    const countRow = await db.getAsync('SELECT COUNT(*) as count FROM follows WHERE following_id = ?', [targetUserId]);

    const followers = await db.allAsync(`
      SELECT 
        u.id, u.name, u.email, u.profile_image, u.role, u.designation, u.department, u.is_verified,
        f.created_at as followed_at,
        CASE WHEN ? IS NOT NULL AND EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND following_id = u.id) THEN 1 ELSE 0 END as is_following_back
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `, [currentUserId, currentUserId, targetUserId]);

    res.json({
      followersCount: countRow.count,
      followers: followers.map(f => ({
        id: f.id,
        name: f.name,
        profileImage: f.profile_image,
        role: f.role,
        designation: f.designation,
        department: f.department,
        isVerified: Boolean(f.is_verified),
        followedAt: f.followed_at,
        isFollowingBack: Boolean(f.is_following_back)
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch followers.' });
  }
});

// GET /api/users/:id/following — Get Following List
router.get('/users/:id/following', optionalAuth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const countRow = await db.getAsync('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?', [targetUserId]);

    const following = await db.allAsync(`
      SELECT u.id, u.name, u.profile_image, u.role, u.designation, u.department, u.is_verified
      FROM follows f JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
    `, [targetUserId]);

    res.json({
      followingCount: countRow.count,
      following: following.map(f => ({
        id: f.id,
        name: f.name,
        profileImage: f.profile_image,
        role: f.role,
        designation: f.designation,
        department: f.department,
        isVerified: Boolean(f.is_verified)
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch following profiles.' });
  }
});

module.exports = router;
