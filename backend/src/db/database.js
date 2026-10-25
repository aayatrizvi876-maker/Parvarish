const sqlite3 = require('sqlite3').verbose();
const constants = require('../config/constants');
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database(constants.DB_PATH, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to persistent SQLite database at:', constants.DB_PATH);
  }
});

// Enable Foreign Keys
db.run('PRAGMA foreign_keys = ON;');

// Helper Promise wrappers for database queries
db.getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

db.runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Table Creation Schema Init
function initDatabaseSchema() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        google_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        profile_image TEXT,
        role TEXT NOT NULL CHECK(role IN ('STUDENT', 'FACULTY', 'ADMIN')),
        designation TEXT,
        department TEXT DEFAULT 'Computer Science & Engineering',
        institution TEXT DEFAULT 'State University of Technology',
        bio TEXT,
        is_verified INTEGER DEFAULT 0,
        status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Posts Table
    db.run(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        author_id TEXT NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category_id TEXT NOT NULL,
        media_url TEXT,
        media_type TEXT,
        attachment_url TEXT,
        status TEXT DEFAULT 'PUBLISHED' CHECK(status IN ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED')),
        is_pinned INTEGER DEFAULT 0,
        comments_enabled INTEGER DEFAULT 1,
        scheduled_at DATETIME,
        published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Comments Table
    db.run(`
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id),
        parent_comment_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'VISIBLE' CHECK(status IN ('VISIBLE', 'HIDDEN', 'DELETED', 'REPORTED')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Post Likes Table (Unique Constraint)
    db.run(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id)
      )
    `);

    // 5. Comment Likes Table (Unique Constraint)
    db.run(`
      CREATE TABLE IF NOT EXISTS comment_likes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, comment_id)
      )
    `);

    // 6. Follows Table (Unique Constraint)
    db.run(`
      CREATE TABLE IF NOT EXISTS follows (
        id TEXT PRIMARY KEY,
        follower_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      )
    `);

    // 7. Events Table
    db.run(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        event_date TEXT NOT NULL,
        event_time TEXT NOT NULL,
        venue TEXT NOT NULL,
        organizer TEXT NOT NULL,
        status TEXT DEFAULT 'UPCOMING' CHECK(status IN ('UPCOMING', 'COMPLETED', 'CANCELLED')),
        created_by TEXT NOT NULL REFERENCES users(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 8. Achievements Table
    db.run(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        person_name TEXT NOT NULL,
        role TEXT NOT NULL,
        department TEXT NOT NULL,
        title TEXT NOT NULL,
        award TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        achievement_date TEXT NOT NULL,
        created_by TEXT NOT NULL REFERENCES users(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 9. Notifications Table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        reference_id TEXT,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 10. Reports Table
    db.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        reporter_id TEXT NOT NULL REFERENCES users(id),
        comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'RESOLVED', 'DISMISSED')),
        reviewed_by TEXT REFERENCES users(id),
        reviewed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 12. Saved Posts Table
    db.run(`
      CREATE TABLE IF NOT EXISTS saved_posts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id)
      )
    `);

    // Ensure posts table has extended columns
    db.run(`ALTER TABLE posts ADD COLUMN carousel_images TEXT`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN sub_category TEXT`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN reading_time_minutes INTEGER DEFAULT 3`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN cover_image TEXT`, () => {});
    db.run(`ALTER TABLE posts ADD COLUMN table_of_contents TEXT`, () => {});

    console.log('Database tables verified / initialized successfully.');
  });
}

initDatabaseSchema();

module.exports = db;
