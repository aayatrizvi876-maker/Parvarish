const express = require('express');
const cors = require('cors');
const path = require('path');
const constants = require('./config/constants');
const db = require('./db/database');
const seedData = require('./db/seed');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload media files
app.use('/uploads', express.static(constants.UPLOADS_DIR));

// Register API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api', require('./routes/comments'));
app.use('/api', require('./routes/follows'));
app.use('/api/events', require('./routes/events'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/magazine', require('./routes/magazine'));
app.use('/api/admin', require('./routes/moderation'));
app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/analytics'));
app.use('/api', require('./routes/uploads'));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'PARVARISH — Official Department Community API',
    tagline: 'Where Every Story Grows.',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build files if present (for single-service deployment)
const fs = require('fs');
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Auto-seed database if empty on startup
db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
  if (!err && row && row.count === 0) {
    console.log('Database empty. Triggering automatic seed...');
    seedData();
  }
});

app.listen(constants.PORT, () => {
  console.log(`=======================================================`);
  console.log(`  PARVARISH BACKEND SERVER RUNNING ON PORT ${constants.PORT}`);
  console.log(`  Health Check: http://localhost:${constants.PORT}/api/health`);
  console.log(`=======================================================`);
});
