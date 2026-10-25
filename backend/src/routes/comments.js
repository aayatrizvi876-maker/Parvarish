const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');

// GET /api/posts/:id/comments — Fetch Nested Comments Tree
router.get('/posts/:id/comments', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const rows = await db.allAsync(`
      SELECT 
        c.*,
        u.name as user_name,
        u.profile_image as user_image,
        u.role as user_role,
        u.designation as user_designation,
        u.is_verified as user_verified,
        (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id) as likes_count,
        CASE WHEN ? IS NOT NULL AND EXISTS(SELECT 1 FROM comment_likes WHERE comment_id = c.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked_by_me
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ? AND c.status IN ('VISIBLE', 'REPORTED')
      ORDER BY c.created_at ASC
    `, [currentUserId, currentUserId, id]);

    const commentMap = {};
    const rootComments = [];

    rows.forEach(r => {
      commentMap[r.id] = {
        id: r.id,
        postId: r.post_id,
        parentCommentId: r.parent_comment_id,
        content: r.content,
        status: r.status,
        createdAt: r.created_at,
        user: {
          id: r.user_id,
          name: r.user_name,
          profileImage: r.user_image,
          role: r.user_role,
          designation: r.user_designation,
          isVerified: Boolean(r.user_verified)
        },
        likesCount: r.likes_count,
        isLikedByMe: Boolean(r.is_liked_by_me),
        replies: []
      };
    });

    rows.forEach(r => {
      if (r.parent_comment_id && commentMap[r.parent_comment_id]) {
        commentMap[r.parent_comment_id].replies.push(commentMap[r.id]);
      } else {
        rootComments.push(commentMap[r.id]);
      }
    });

    res.json({ comments: rootComments, totalComments: rows.length });
  } catch (err) {
    console.error('Fetch comments error:', err);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
});

// POST /api/posts/:id/comments — Add Comment / Reply
router.post('/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id: postId } = req.params;
    const { content, parentCommentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content cannot be empty.' });
    }

    const post = await db.getAsync('SELECT * FROM posts WHERE id = ?', [postId]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (!post.comments_enabled && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Comments are disabled for this official post.' });
    }

    const newId = 'cmt_' + uuidv4().slice(0, 12);
    await db.runAsync(`
      INSERT INTO comments (id, post_id, user_id, parent_comment_id, content, status)
      VALUES (?, ?, ?, ?, ?, 'VISIBLE')
    `, [newId, postId, req.user.id, parentCommentId || null, content.trim()]);

    // Send notification if reply
    if (parentCommentId) {
      const parentCmt = await db.getAsync('SELECT user_id FROM comments WHERE id = ?', [parentCommentId]);
      if (parentCmt && parentCmt.user_id !== req.user.id) {
        await db.runAsync(`
          INSERT INTO notifications (id, user_id, type, title, message, reference_id)
          VALUES (?, ?, 'REPLY', ?, ?, ?)
        `, [
          uuidv4(),
          parentCmt.user_id,
          `${req.user.name} replied to your comment`,
          content.trim().length > 60 ? content.trim().substring(0, 60) + '...' : content.trim(),
          postId
        ]);
      }
    }

    const created = await db.getAsync(`
      SELECT c.*, u.name as user_name, u.profile_image as user_image, u.role as user_role, u.designation as user_designation, u.is_verified as user_verified
      FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?
    `, [newId]);

    res.status(201).json({
      message: 'Comment added successfully.',
      comment: {
        id: created.id,
        postId: created.post_id,
        parentCommentId: created.parent_comment_id,
        content: created.content,
        status: created.status,
        createdAt: created.created_at,
        user: {
          id: created.user_id,
          name: created.user_name,
          profileImage: created.user_image,
          role: created.user_role,
          designation: created.user_designation,
          isVerified: Boolean(created.user_verified)
        },
        likesCount: 0,
        isLikedByMe: false,
        replies: []
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post comment.' });
  }
});

// POST /api/comments/:id/like — Like Comment
router.post('/comments/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      await db.runAsync('INSERT INTO comment_likes (id, user_id, comment_id) VALUES (?, ?, ?)', [uuidv4(), userId, id]);
    } catch (e) {
      return res.status(400).json({ message: 'Comment already liked.' });
    }

    const countRow = await db.getAsync('SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?', [id]);
    res.json({ message: 'Comment liked', likesCount: countRow.count, isLikedByMe: true });
  } catch (err) {
    res.status(500).json({ error: 'Error liking comment.' });
  }
});

// DELETE /api/comments/:id/like — Unlike Comment
router.delete('/comments/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.runAsync('DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?', [userId, id]);
    const countRow = await db.getAsync('SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?', [id]);
    res.json({ message: 'Comment unliked', likesCount: countRow.count, isLikedByMe: false });
  } catch (err) {
    res.status(500).json({ error: 'Error unliking comment.' });
  }
});

// POST /api/comments/:id/report — Report Comment for Moderation
router.post('/comments/:id/report', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Inappropriate content' } = req.body;

    const cmt = await db.getAsync('SELECT * FROM comments WHERE id = ?', [id]);
    if (!cmt) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    await db.runAsync(`
      INSERT INTO reports (id, reporter_id, comment_id, reason, status)
      VALUES (?, ?, ?, ?, 'PENDING')
    `, [uuidv4(), req.user.id, id, reason]);

    // Flag comment status as REPORTED
    await db.runAsync("UPDATE comments SET status = 'REPORTED' WHERE id = ?", [id]);

    res.json({ message: 'Comment reported to HOD Moderation Desk. Thank you.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to report comment.' });
  }
});

// DELETE /api/comments/:id — Delete Comment (Author or ADMIN)
router.delete('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const cmt = await db.getAsync('SELECT * FROM comments WHERE id = ?', [id]);

    if (!cmt) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (cmt.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden. You cannot delete this comment.' });
    }

    await db.runAsync("UPDATE comments SET status = 'DELETED' WHERE id = ?", [id]);
    res.json({ message: 'Comment deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
});

module.exports = router;
