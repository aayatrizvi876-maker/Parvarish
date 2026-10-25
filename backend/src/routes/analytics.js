const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/admin/analytics — Platform Overview & Engagement Analytics (ADMIN ONLY)
router.get('/admin/analytics', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const totalUsersRow = await db.getAsync('SELECT COUNT(*) as count FROM users');
    const studentsRow = await db.getAsync("SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'");
    const facultyRow = await db.getAsync("SELECT COUNT(*) as count FROM users WHERE role = 'FACULTY'");
    const adminsRow = await db.getAsync("SELECT COUNT(*) as count FROM users WHERE role = 'ADMIN'");
    
    const postsRow = await db.getAsync("SELECT COUNT(*) as count FROM posts WHERE status = 'PUBLISHED'");
    const likesRow = await db.getAsync('SELECT COUNT(*) as count FROM post_likes');
    const commentsRow = await db.getAsync("SELECT COUNT(*) as count FROM comments WHERE status = 'VISIBLE'");
    
    const hodUser = await db.getAsync("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
    const followersRow = hodUser ? await db.getAsync('SELECT COUNT(*) as count FROM follows WHERE following_id = ?', [hodUser.id]) : { count: 0 };

    // Category Distribution
    const categoryStats = await db.allAsync(`
      SELECT category_id as category, COUNT(*) as postCount 
      FROM posts 
      WHERE status = 'PUBLISHED'
      GROUP BY category_id
    `);

    // Top Pinned / Popular Posts
    const popularPosts = await db.allAsync(`
      SELECT p.id, p.title, p.category_id, p.published_at,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments
      FROM posts p
      WHERE p.status = 'PUBLISHED'
      ORDER BY likes DESC, comments DESC
      LIMIT 5
    `);

    // Recent Audit Logs
    const auditLogs = await db.allAsync(`
      SELECT a.*, u.name as admin_name
      FROM audit_logs a
      JOIN users u ON a.admin_id = u.id
      ORDER BY a.timestamp DESC
      LIMIT 10
    `);

    res.json({
      metrics: {
        totalUsers: totalUsersRow.count,
        studentsCount: studentsRow.count,
        facultyCount: facultyRow.count,
        adminsCount: adminsRow.count,
        totalPosts: postsRow.count,
        totalLikes: likesRow.count,
        totalComments: commentsRow.count,
        totalFollowers: followersRow.count,
        engagementRate: postsRow.count > 0 ? (((likesRow.count + commentsRow.count) / postsRow.count)).toFixed(1) : '0.0'
      },
      categoryStats,
      popularPosts,
      auditLogs
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to generate platform analytics.' });
  }
});

module.exports = router;
