const path = require('path');
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'parvarish_secret_jwt_key_2026_super_secure',
  ADMIN_VERIFICATION_CODE: process.env.ADMIN_VERIFICATION_CODE || 'PARVARISH_HOD_2026',
  UPLOADS_DIR: path.join(__dirname, '../../uploads'),
  DB_PATH: path.join(__dirname, '../../database.sqlite'),
  HOD_OFFICIAL: {
    GOOGLE_ID: 'google_hod_official_001',
    NAME: 'Prof. Dr. Anand Kumar Gupta',
    EMAIL: 'hod.cse@university.edu.in',
    ROLE: 'ADMIN',
    DESIGNATION: 'Head of Department',
    DEPARTMENT: 'Computer Science & Engineering',
    INSTITUTION: 'State University of Technology',
    BIO: 'Official Publishing Identity of the CSE Department. Dedicated to fostering innovation, academic excellence, and student empowerment.',
    IS_VERIFIED: 1,
    PROFILE_IMAGE: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  }
};
