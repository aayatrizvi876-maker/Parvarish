const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');

// GET /api/posts/saved — Retrieve Saved Posts for Logged-In User
router.get('/saved', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const rows = await db.allAsync(`
      SELECT 
        p.*,
        u.name as author_name,
        u.profile_image as author_image,
        u.designation as author_designation,
        u.department as author_department,
        u.is_verified as author_verified,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND status = 'VISIBLE') as comments_count,
        1 as is_saved_by_me,
        CASE WHEN EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked_by_me
      FROM saved_posts sp
      JOIN posts p ON sp.post_id = p.id
      JOIN users u ON p.author_id = u.id
      WHERE sp.user_id = ?
      ORDER BY sp.created_at DESC
    `, [currentUserId, currentUserId]);

    const posts = rows.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      categoryId: r.category_id,
      subCategory: r.sub_category,
      mediaUrl: r.media_url,
      mediaType: r.media_type,
      carouselImages: r.carousel_images ? JSON.parse(r.carousel_images) : [],
      readingTimeMinutes: r.reading_time_minutes || 3,
      coverImage: r.cover_image,
      attachmentUrl: r.attachment_url,
      status: r.status,
      isPinned: Boolean(r.is_pinned),
      commentsEnabled: Boolean(r.comments_enabled),
      publishedAt: r.published_at,
      createdAt: r.created_at,
      author: {
        id: r.author_id,
        name: r.author_name,
        profileImage: r.author_image,
        designation: r.author_designation,
        department: r.author_department,
        isVerified: Boolean(r.author_verified)
      },
      likesCount: r.likes_count,
      commentsCount: r.comments_count,
      isLikedByMe: Boolean(r.is_liked_by_me),
      isSavedByMe: true
    }));

    res.json({ posts, count: posts.length });
  } catch (err) {
    console.error('Fetch saved posts error:', err);
    res.status(500).json({ error: 'Failed to fetch saved posts.' });
  }
});

// GET /api/posts — Retrieve Official Feed (Pinned posts first, then newest published)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search, status = 'PUBLISHED', limit = 20, offset = 0 } = req.query;
    const currentUserId = req.user ? req.user.id : null;

    let sql = `
      SELECT 
        p.*,
        u.name as author_name,
        u.profile_image as author_image,
        u.designation as author_designation,
        u.department as author_department,
        u.is_verified as author_verified,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND status = 'VISIBLE') as comments_count,
        CASE WHEN ? IS NOT NULL AND EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked_by_me,
        CASE WHEN ? IS NOT NULL AND EXISTS(SELECT 1 FROM saved_posts WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_saved_by_me
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE 1=1
    `;

    const params = [currentUserId, currentUserId, currentUserId, currentUserId];

    // Status filter: Non-admins can ONLY view PUBLISHED posts
    if (!req.user || req.user.role !== 'ADMIN') {
      sql += ` AND p.status = 'PUBLISHED'`;
    } else if (status) {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    if (category && category.toLowerCase() !== 'all') {
      sql += ` AND (LOWER(p.category_id) = LOWER(?) OR LOWER(p.sub_category) = LOWER(?))`;
      params.push(category, category);
    }

    if (search) {
      sql += ` AND (p.title LIKE ? OR p.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY p.is_pinned DESC, p.published_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const rows = await db.allAsync(sql, params);

    const posts = rows.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      categoryId: r.category_id,
      subCategory: r.sub_category,
      mediaUrl: r.media_url,
      mediaType: r.media_type,
      carouselImages: r.carousel_images ? JSON.parse(r.carousel_images) : [],
      readingTimeMinutes: r.reading_time_minutes || 3,
      coverImage: r.cover_image,
      attachmentUrl: r.attachment_url,
      status: r.status,
      isPinned: Boolean(r.is_pinned),
      commentsEnabled: Boolean(r.comments_enabled),
      publishedAt: r.published_at,
      createdAt: r.created_at,
      author: {
        id: r.author_id,
        name: r.author_name,
        profileImage: r.author_image,
        designation: r.author_designation,
        department: r.author_department,
        isVerified: Boolean(r.author_verified)
      },
      likesCount: r.likes_count,
      commentsCount: r.comments_count,
      isLikedByMe: Boolean(r.is_liked_by_me),
      isSavedByMe: Boolean(r.is_saved_by_me)
    }));

    res.json({ posts, count: posts.length });
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
});

// GET /api/posts/:id — Get Single Post Detail
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const r = await db.getAsync(`
      SELECT 
        p.*,
        u.name as author_name,
        u.profile_image as author_image,
        u.designation as author_designation,
        u.department as author_department,
        u.is_verified as author_verified,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND status = 'VISIBLE') as comments_count,
        CASE WHEN ? IS NOT NULL AND EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = ?) THEN 1 ELSE 0 END as is_liked_by_me
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = ?
    `, [currentUserId, currentUserId, id]);

    if (!r) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (r.status !== 'PUBLISHED' && (!req.user || req.user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'This post is not currently available.' });
    }

    const post = {
      id: r.id,
      title: r.title,
      content: r.content,
      categoryId: r.category_id,
      mediaUrl: r.media_url,
      mediaType: r.media_type,
      attachmentUrl: r.attachment_url,
      status: r.status,
      isPinned: Boolean(r.is_pinned),
      commentsEnabled: Boolean(r.comments_enabled),
      publishedAt: r.published_at,
      createdAt: r.created_at,
      author: {
        id: r.author_id,
        name: r.author_name,
        profileImage: r.author_image,
        designation: r.author_designation,
        department: r.author_department,
        isVerified: Boolean(r.author_verified)
      },
      likesCount: r.likes_count,
      commentsCount: r.comments_count,
      isLikedByMe: Boolean(r.is_liked_by_me)
    };

    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve post details.' });
  }
});

// POST /api/posts — Create & Publish Official Post (ADMIN ONLY)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, content, categoryId, mediaUrl, mediaType, attachmentUrl, status = 'PUBLISHED', isPinned = false, commentsEnabled = true, scheduledAt } = req.body;

    if (!title || !content || !categoryId) {
      return res.status(400).json({ error: 'Title, content, and category are required.' });
    }

    const newPostId = 'post_' + uuidv4().slice(0, 12);
    const authorId = req.user.id;

    await db.runAsync(`
      INSERT INTO posts (id, author_id, title, content, category_id, media_url, media_type, attachment_url, status, is_pinned, comments_enabled, scheduled_at, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      newPostId,
      authorId,
      title,
      content,
      categoryId,
      mediaUrl || null,
      mediaType || 'image',
      attachmentUrl || null,
      status,
      isPinned ? 1 : 0,
      commentsEnabled ? 1 : 0,
      scheduledAt || null
    ]);

    // Send automated notification to all HOD followers
    if (status === 'PUBLISHED') {
      const followers = await db.allAsync('SELECT follower_id FROM follows WHERE following_id = ?', [authorId]);
      for (const f of followers) {
        await db.runAsync(`
          INSERT INTO notifications (id, user_id, type, title, message, reference_id)
          VALUES (?, ?, 'ANNOUNCEMENT', ?, ?, ?)
        `, [
          uuidv4(),
          f.follower_id,
          `${req.user.name} published a new post`,
          title.length > 60 ? title.substring(0, 60) + '...' : title,
          newPostId
        ]);
      }
    }

    // Log admin audit action
    await db.runAsync(`
      INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, metadata)
      VALUES (?, ?, 'CREATE_POST', 'POST', ?, ?)
    `, [uuidv4(), authorId, newPostId, JSON.stringify({ title, categoryId, status })]);

    const createdPost = await db.getAsync('SELECT * FROM posts WHERE id = ?', [newPostId]);

    res.status(201).json({
      message: 'Official post published successfully under HOD identity.',
      post: createdPost
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Failed to create official post.' });
  }
});

// PATCH /api/posts/:id — Edit Post (ADMIN ONLY)
router.patch('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, categoryId, mediaUrl, mediaType, attachmentUrl, status, isPinned, commentsEnabled } = req.body;

    const existing = await db.getAsync('SELECT * FROM posts WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    await db.runAsync(`
      UPDATE posts SET
        title = COALESCE(?, title),
        content = COALESCE(?, content),
        category_id = COALESCE(?, category_id),
        media_url = COALESCE(?, media_url),
        media_type = COALESCE(?, media_type),
        attachment_url = COALESCE(?, attachment_url),
        status = COALESCE(?, status),
        is_pinned = CASE WHEN ? IS NOT NULL THEN ? ELSE is_pinned END,
        comments_enabled = CASE WHEN ? IS NOT NULL THEN ? ELSE comments_enabled END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title, content, categoryId, mediaUrl, mediaType, attachmentUrl, status,
      isPinned !== undefined ? (isPinned ? 1 : 0) : null, isPinned ? 1 : 0,
      commentsEnabled !== undefined ? (commentsEnabled ? 1 : 0) : null, commentsEnabled ? 1 : 0,
      id
    ]);

    await db.runAsync(`
      INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, metadata)
      VALUES (?, ?, 'EDIT_POST', 'POST', ?, ?)
    `, [uuidv4(), req.user.id, id, JSON.stringify(req.body)]);

    const updated = await db.getAsync('SELECT * FROM posts WHERE id = ?', [id]);
    res.json({ message: 'Post updated successfully.', post: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post.' });
  }
});

// DELETE /api/posts/:id — Delete Post (ADMIN ONLY)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await db.getAsync('SELECT * FROM posts WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    await db.runAsync('DELETE FROM posts WHERE id = ?', [id]);

    await db.runAsync(`
      INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, metadata)
      VALUES (?, ?, 'DELETE_POST', 'POST', ?, ?)
    `, [uuidv4(), req.user.id, id, JSON.stringify({ title: existing.title })]);

    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post.' });
  }
});

// POST /api/posts/:id/like — Like Post (AUTHENTICATED USERS)
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await db.getAsync('SELECT id FROM posts WHERE id = ?', [id]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    try {
      await db.runAsync('INSERT INTO post_likes (id, user_id, post_id) VALUES (?, ?, ?)', [uuidv4(), userId, id]);
    } catch (e) {
      // Unique constraint prevents duplicate likes
      return res.status(400).json({ message: 'Post already liked by user.' });
    }

    const countRow = await db.getAsync('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?', [id]);

    res.json({ message: 'Post liked', likesCount: countRow.count, isLikedByMe: true });
  } catch (err) {
    res.status(500).json({ error: 'Error liking post.' });
  }
});

// DELETE /api/posts/:id/like — Unlike Post (AUTHENTICATED USERS)
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.runAsync('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?', [userId, id]);
    const countRow = await db.getAsync('SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?', [id]);

    res.json({ message: 'Post unliked', likesCount: countRow.count, isLikedByMe: false });
  } catch (err) {
    res.status(500).json({ error: 'Error unliking post.' });
  }
});

// POST /api/posts/:id/save — Bookmark / Save Post
router.post('/:id/save', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await db.getAsync('SELECT id FROM posts WHERE id = ?', [id]);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    try {
      await db.runAsync('INSERT INTO saved_posts (id, user_id, post_id) VALUES (?, ?, ?)', [uuidv4(), userId, id]);
    } catch (e) {
      return res.json({ message: 'Post already saved', isSavedByMe: true });
    }

    res.json({ message: 'Post saved to bookmarks', isSavedByMe: true });
  } catch (err) {
    res.status(500).json({ error: 'Error saving post.' });
  }
});

// DELETE /api/posts/:id/save — Unsave Post
router.delete('/:id/save', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await db.runAsync('DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?', [userId, id]);
    res.json({ message: 'Post removed from saved bookmarks', isSavedByMe: false });
  } catch (err) {
    res.status(500).json({ error: 'Error unsaving post.' });
  }
});

module.exports = router;
