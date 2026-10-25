const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db/database');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');

// GET /api/events — List Events (Upcoming / Past filter)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM events';
    const params = [];

    if (status) {
      sql += ' WHERE UPPER(status) = UPPER(?)';
      params.push(status);
    }

    sql += ' ORDER BY event_date DESC';
    const rows = await db.allAsync(sql, params);

    res.json({
      events: rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        imageUrl: r.image_url,
        eventDate: r.event_date,
        eventTime: r.event_time,
        venue: r.venue,
        organizer: r.organizer,
        status: r.status,
        createdBy: r.created_by,
        createdAt: r.created_at
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// POST /api/events — Create Event (ADMIN ONLY)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { title, description, imageUrl, eventDate, eventTime, venue, organizer, status = 'UPCOMING' } = req.body;

    if (!title || !description || !eventDate || !venue) {
      return res.status(400).json({ error: 'Title, description, eventDate, and venue are required.' });
    }

    const newId = 'evt_' + uuidv4().slice(0, 12);
    await db.runAsync(`
      INSERT INTO events (id, title, description, image_url, event_date, event_time, venue, organizer, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [newId, title, description, imageUrl || null, eventDate, eventTime || '10:00 AM', venue, organizer || 'Department of CSE', status, req.user.id]);

    await db.runAsync(`
      INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, metadata)
      VALUES (?, ?, 'CREATE_EVENT', 'EVENT', ?, ?)
    `, [uuidv4(), req.user.id, newId, JSON.stringify({ title, eventDate })]);

    const created = await db.getAsync('SELECT * FROM events WHERE id = ?', [newId]);
    res.status(201).json({ message: 'Event created successfully.', event: created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event.' });
  }
});

// PATCH /api/events/:id — Edit Event (ADMIN ONLY)
router.patch('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, eventDate, eventTime, venue, organizer, status } = req.body;

    await db.runAsync(`
      UPDATE events SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        image_url = COALESCE(?, image_url),
        event_date = COALESCE(?, event_date),
        event_time = COALESCE(?, event_time),
        venue = COALESCE(?, venue),
        organizer = COALESCE(?, organizer),
        status = COALESCE(?, status),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, description, imageUrl, eventDate, eventTime, venue, organizer, status, id]);

    const updated = await db.getAsync('SELECT * FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event updated successfully.', event: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update event.' });
  }
});

// DELETE /api/events/:id — Delete Event (ADMIN ONLY)
router.delete('/:id', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.runAsync('DELETE FROM events WHERE id = ?', [id]);
    res.json({ message: 'Event deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete event.' });
  }
});

module.exports = router;
