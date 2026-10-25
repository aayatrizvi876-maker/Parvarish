const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/admin/moderation — Reported Comments Moderation Queue (ADMIN ONLY)
router.get('/moderation', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { status = 'PENDING' } = req.query;

    const rows = await db.allAsync(`
      SELECT 
        r.id as report_id,
        r.reason,
        r.status as report_status,
        r.created_at as reported_at,
        c.id as comment_id,
        c.content as comment_content,
        c.post_id,
        c.status as comment_status,
        u_author.id as author_id,
        u_author.name as author_name,
        u_author.email as author_email,
        u_author.profile_image as author_image,
        u_reporter.name as reporter_name
      FROM reports r
      JOIN comments c ON r.comment_id = c.id
      JOIN users u_author ON c.user_id = u_author.id
      JOIN users u_reporter ON r.reporter_id = u_reporter.id
      WHERE r.status = ?
      ORDER BY r.created_at DESC
    `, [status]);

    res.json({
      reports: rows.map(r => ({
        reportId: r.report_id,
        reason: r.reason,
        reportStatus: r.report_status,
        reportedAt: r.reported_at,
        comment: {
          id: r.comment_id,
          postId: r.post_id,
          content: r.comment_content,
          status: r.comment_status,
          author: {
            id: r.author_id,
            name: r.author_name,
            email: r.author_email,
            profileImage: r.author_image
          }
        },
        reporterName: r.reporter_name
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch moderation reports.' });
  }
});

// PATCH /api/admin/moderation/:reportId — Moderate Reported Comment (ADMIN ONLY)
router.patch('/moderation/:reportId', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { reportId } = req.params;
    const { action } = req.body; // 'DISMISS', 'HIDE', 'DELETE', 'RESTRICT_USER'

    const report = await db.getAsync('SELECT * FROM reports WHERE id = ?', [reportId]);
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    if (action === 'DISMISS') {
      await db.runAsync("UPDATE reports SET status = 'DISMISSED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?", [req.user.id, reportId]);
      await db.runAsync("UPDATE comments SET status = 'VISIBLE' WHERE id = ?", [report.comment_id]);
    } else if (action === 'HIDE') {
      await db.runAsync("UPDATE reports SET status = 'RESOLVED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?", [req.user.id, reportId]);
      await db.runAsync("UPDATE comments SET status = 'HIDDEN' WHERE id = ?", [report.comment_id]);
    } else if (action === 'DELETE') {
      await db.runAsync("UPDATE reports SET status = 'RESOLVED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?", [req.user.id, reportId]);
      await db.runAsync("UPDATE comments SET status = 'DELETED' WHERE id = ?", [report.comment_id]);
    } else if (action === 'RESTRICT_USER') {
      const cmt = await db.getAsync('SELECT user_id FROM comments WHERE id = ?', [report.comment_id]);
      if (cmt) {
        await db.runAsync("UPDATE users SET status = 'SUSPENDED' WHERE id = ?", [cmt.user_id]);
      }
      await db.runAsync("UPDATE reports SET status = 'RESOLVED', reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?", [req.user.id, reportId]);
      await db.runAsync("UPDATE comments SET status = 'HIDDEN' WHERE id = ?", [report.comment_id]);
    }

    await db.runAsync(`
      INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, metadata)
      VALUES (?, ?, ?, 'REPORT', ?, ?)
    `, [uuidv4(), req.user.id, `MODERATE_${action}`, reportId, JSON.stringify({ action })]);

    res.json({ message: `Moderation action '${action}' applied successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process moderation action.' });
  }
});

module.exports = router;
