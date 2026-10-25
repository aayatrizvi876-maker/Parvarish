const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// GET /api/notifications — Fetch Notifications for Current User
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const rows = await db.allAsync('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [userId]);
    const unreadRow = await db.getAsync('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0', [userId]);

    res.json({
      unreadCount: unreadRow.count,
      notifications: rows.map(r => ({
        id: r.id,
        type: r.type,
        title: r.title,
        message: r.message,
        referenceId: r.reference_id,
        isRead: Boolean(r.is_read),
        createdAt: r.created_at
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

// PATCH /api/notifications/:id/read — Mark Single Notification Read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.runAsync('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// PATCH /api/notifications/read-all — Mark All Notifications Read
router.patch('/read-all', authenticateToken, async (req, res) => {
  try {
    await db.runAsync('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update notifications.' });
  }
});

module.exports = router;
