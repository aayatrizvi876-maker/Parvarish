const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateToken, requireRole } = require('../middleware/auth');

// POST /api/upload — Upload File Media (ADMIN ONLY)
router.post('/upload', authenticateToken, requireRole('ADMIN'), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : req.file.mimetype.startsWith('video/') ? 'video' : 'pdf';

    res.json({
      message: 'File uploaded successfully.',
      fileUrl,
      mediaType,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    res.status(500).json({ error: 'File upload failed.' });
  }
});

module.exports = router;
