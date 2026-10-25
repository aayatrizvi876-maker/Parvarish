const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');

// GET /api/achievements — Wall of Achievements List
router.get('/', optionalAuth, async (req, res) => {
  try {
    const rows = await db.allAsync('SELECT * FROM achievements ORDER BY achievement_date DESC');
    res.json({
      achievements: rows.map(r => ({
        id: r.id,
        personName: r.person_name,
        role: r.role,
        department: r.department,
        title: r.title,
        award: r.award,
        description: r.description,
        imageUrl: r.image_url,
        achievementDate: r.achievement_date,
        createdAt: r.created_at
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch achievements.' });
  }
});

// POST /api/achievements — Create Achievement (ADMIN ONLY)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { personName, role, department = 'Computer Science & Engineering', title, award, description, imageUrl, achievementDate } = req.body;

    if (!personName || !title || !award || !description) {
      return res.status(400).json({ error: 'Person name, title, award, and description are required.' });
    }

    const newId = 'ach_' + uuidv4().slice(0, 12);
    await db.runAsync(`
      INSERT INTO achievements (id, person_name, role, department, title, award, description, image_url, achievement_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      newId,
      personName,
      role || 'Student',
      department,
      title,
      award,
      description,
      imageUrl || null,
      achievementDate || new Date().toISOString().split('T')[0],
      req.user.id
    ]);

    await db.runAsync(`
      INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, metadata)
      VALUES (?, ?, 'CREATE_ACHIEVEMENT', 'ACHIEVEMENT', ?, ?)
    `, [uuidv4(), req.user.id, newId, JSON.stringify({ personName, title })]);

    const created = await db.getAsync('SELECT * FROM achievements WHERE id = ?', [newId]);
    res.status(201).json({ message: 'Achievement created on Wall of Achievements.', achievement: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create achievement.' });
  }
});

// DELETE /api/achievements/:id — Delete Achievement (ADMIN ONLY)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.runAsync('DELETE FROM achievements WHERE id = ?', [id]);
    res.json({ message: 'Achievement deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete achievement.' });
  }
});

module.exports = router;
