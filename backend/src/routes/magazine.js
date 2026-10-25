const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { optionalAuth } = require('../middleware/auth');

// GET /api/magazine/editions — Get Digital Magazine Editions & Featured Issue
router.get('/editions', optionalAuth, async (req, res) => {
  try {
    const currentIssue = {
      issueNumber: 'Volume IV, Issue 9 (Autumn Edition 2026)',
      title: 'Innovations, Leadership & The Future of Technology',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
      publishedDate: 'September 2026',
      editorInChief: 'Prof. Dr. Anand Kumar Gupta',
      editorialMessage: 'Welcome to the Autumn 2026 Edition of Parvarish. In this issue, we spotlight groundbreaking student research in AI, faculty leadership, and campus achievements that define our university culture.',
      totalArticles: 14,
      sections: [
        'Editorial',
        'Campus News',
        'Faculty Articles',
        'Student Blogs',
        'Research & Innovation',
        'Photography',
        'Poetry',
        'Creative Writing',
        'Alumni Stories',
        'Achievements',
        'Startup Spotlight'
      ]
    };

    // Fetch featured magazine articles from posts
    const rows = await db.allAsync(`
      SELECT 
        p.*,
        u.name as author_name,
        u.profile_image as author_image,
        u.designation as author_designation,
        u.department as author_department,
        (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND status = 'VISIBLE') as comments_count
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.status = 'PUBLISHED'
      ORDER BY p.published_at DESC
      LIMIT 12
    `);

    const articles = rows.map(r => ({
      id: r.id,
      title: r.title,
      content: r.content,
      categoryId: r.category_id,
      subCategory: r.sub_category || 'Article',
      mediaUrl: r.media_url,
      readingTimeMinutes: r.reading_time_minutes || 4,
      publishedAt: r.published_at,
      author: {
        id: r.author_id,
        name: r.author_name,
        profileImage: r.author_image,
        designation: r.author_designation,
        department: r.author_department
      },
      likesCount: r.likes_count,
      commentsCount: r.comments_count
    }));

    res.json({
      issue: currentIssue,
      articles
    });
  } catch (err) {
    console.error('Magazine fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch magazine content.' });
  }
});

module.exports = router;
