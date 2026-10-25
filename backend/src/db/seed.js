const db = require('./database');
const constants = require('../config/constants');
const { v4: uuidv4 } = require('uuid');

async function seedData() {
  console.log('Seeding initial data into Parvarish database...');

  try {
    // 1. Seed Official HOD Admin Account
    const hod = constants.HOD_OFFICIAL;
    const hodId = 'usr_hod_official_001';

    await db.runAsync(`
      INSERT OR REPLACE INTO users 
      (id, google_id, name, email, profile_image, role, designation, department, institution, bio, is_verified, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      hodId,
      hod.GOOGLE_ID,
      hod.NAME,
      hod.EMAIL,
      hod.PROFILE_IMAGE,
      hod.ROLE,
      hod.DESIGNATION,
      hod.DEPARTMENT,
      hod.INSTITUTION,
      hod.BIO,
      hod.IS_VERIFIED,
      'ACTIVE'
    ]);

    // 2. Seed Faculty Accounts
    const facultyList = [
      {
        id: 'usr_fac_001',
        googleId: 'google_fac_001',
        name: 'Dr. Meera Verma',
        email: 'meera.verma@university.edu.in',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        designation: 'Associate Professor & Research Chair',
        bio: 'Machine Learning enthusiast, mentor, and researcher.'
      },
      {
        id: 'usr_fac_002',
        googleId: 'google_fac_002',
        name: 'Prof. Rajesh Gupta',
        email: 'rajesh.gupta@university.edu.in',
        profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
        designation: 'Assistant Professor, Systems & Networks',
        bio: 'Passionate about Cloud Computing and Distributed Systems.'
      }
    ];

    for (const f of facultyList) {
      await db.runAsync(`
        INSERT OR REPLACE INTO users
        (id, google_id, name, email, profile_image, role, designation, department, institution, bio, is_verified, status)
        VALUES (?, ?, ?, ?, ?, 'FACULTY', ?, 'Computer Science & Engineering', 'State University of Technology', ?, 1, 'ACTIVE')
      `, [f.id, f.googleId, f.name, f.email, f.profileImage, f.designation, f.bio]);
    }

    // 3. Seed Student Accounts
    const studentList = [
      {
        id: 'usr_stu_001',
        googleId: 'google_stu_001',
        name: 'Aarav Mehta',
        email: 'aarav.mehta2026@student.edu.in',
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
        designation: 'Final Year CSE Undergrad',
        bio: 'Competitive programmer & Full-Stack Developer.'
      },
      {
        id: 'usr_stu_002',
        googleId: 'google_stu_002',
        name: 'Ananya Roy',
        email: 'ananya.roy2026@student.edu.in',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        designation: 'Pre-final Year CSE Undergrad',
        bio: 'AI/ML Enthusiast | IEEE Student Branch Coordinator'
      },
      {
        id: 'usr_stu_003',
        googleId: 'google_stu_003',
        name: 'Vikram Patel',
        email: 'vikram.patel2026@student.edu.in',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        designation: 'Sophomore CSE Undergrad',
        bio: 'Cybersecurity researcher and CTF player.'
      },
      {
        id: 'usr_stu_004',
        name: 'Riya Sharma',
        email: 'riya.sharma2026@student.edu.in',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
        designation: 'Final Year CSE Undergrad',
        bio: 'UI/UX Designer & Community Lead.'
      },
      {
        id: 'usr_stu_005',
        name: 'Ayesha Khan',
        email: 'ayesha.khan2026@student.edu.in',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
        designation: 'Student Innovator',
        bio: 'Building accessible campus technology and smart systems.'
      },
      {
        id: 'usr_stu_006',
        name: 'Rahul Verma',
        email: 'rahul.verma2026@student.edu.in',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
        designation: 'Tech Lead, AI Club',
        bio: 'Passionate about machine learning and education technology.'
      }
    ];

    for (const s of studentList) {
      await db.runAsync(`
        INSERT OR REPLACE INTO users 
        (id, google_id, name, email, profile_image, role, designation, department, institution, bio, is_verified, status)
        VALUES (?, ?, ?, ?, ?, 'STUDENT', ?, 'Computer Science & Engineering', 'State University of Technology', ?, 0, 'ACTIVE')
      `, [s.id, s.googleId || s.id, s.name, s.email, s.profileImage, s.designation, s.bio]);
    }

    // 4. Seed Follows (Students & Faculty following HOD profile)
    const followers = ['usr_fac_001', 'usr_fac_002', 'usr_stu_001', 'usr_stu_002', 'usr_stu_003', 'usr_stu_004', 'usr_stu_005', 'usr_stu_006'];
    for (const followerId of followers) {
      await db.runAsync(`
        INSERT OR IGNORE INTO follows (id, follower_id, following_id)
        VALUES (?, ?, ?)
      `, [uuidv4(), followerId, hodId]);
    }

    // 5. Seed Official Posts authored by HOD Admin
    const posts = [
      {
        id: 'post_001',
        authorId: hodId,
        title: 'Welcome to Parvarish — Official Departmental Community Platform',
        content: `Dear Students, Faculty Members, and Esteemed Alumni, It brings me immense pride and joy to welcome you to **Parvarish**, our official Computer Science & Engineering department community platform. Parvarish stands for growth, empowerment, and institutional pride. Here, every academic triumph, innovation, research breakthrough, and creative expression finds a home.`,
        categoryId: 'announcements',
        subCategory: 'ANNOUNCEMENTS',
        mediaUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        isPinned: 1,
        commentsEnabled: 1,
        publishedAt: '2026-09-01T10:00:00.000Z'
      },
      {
        id: 'post_002',
        authorId: 'usr_stu_005',
        title: 'Building Smart Solutions for a Better Campus',
        content: `Excited to share our latest project that aims to make campus life more connected, efficient, and inclusive. Grateful to my team and mentors for their constant support!`,
        categoryId: 'student_spotlight',
        subCategory: 'STUDENT SPOTLIGHT',
        mediaUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        isPinned: 0,
        commentsEnabled: 1,
        publishedAt: '2026-09-03T11:30:00.000Z'
      },
      {
        id: 'post_003',
        authorId: 'usr_stu_006',
        title: 'Moments from the Tech Talk: AI in Education',
        content: `An insightful session with brilliant minds discussing how AI is shaping the future of learning. Grateful to all the speakers and participants for making it a success!`,
        categoryId: 'events',
        subCategory: 'EVENTS',
        mediaUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
        mediaType: 'image',
        isPinned: 0,
        commentsEnabled: 1,
        publishedAt: '2026-09-02T14:15:00.000Z'
      },
      {
        id: 'post_004',
        authorId: hodId,
        title: 'Upcoming Departmental Workshop: Next-Gen Quantum Computing & Cryptography',
        content: `The Department of Computer Science & Engineering is organizing a 2-day expert workshop on **Quantum Computing Foundations & Post-Quantum Cryptography** on September 22-23, 2026. Eminent speakers from IBM Quantum and IISc Bangalore will conduct hands-on lab sessions using Qiskit.`,
        categoryId: 'events',
        subCategory: 'EVENTS',
        mediaUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
        mediaType: 'image',
        isPinned: 0,
        commentsEnabled: 1,
        publishedAt: '2026-08-28T09:00:00.000Z'
      }
    ];

    for (const p of posts) {
      await db.runAsync(`
        INSERT OR REPLACE INTO posts 
        (id, author_id, title, content, category_id, sub_category, media_url, media_type, status, is_pinned, comments_enabled, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', ?, ?, ?)
      `, [p.id, p.authorId || hodId, p.title, p.content, p.categoryId, p.subCategory || null, p.mediaUrl, p.mediaType, p.isPinned, p.commentsEnabled, p.publishedAt || new Date().toISOString()]);
    }

    // 6. Seed Post Likes
    const postLikesData = [
      { userId: 'usr_fac_001', postId: 'post_001' },
      { userId: 'usr_stu_001', postId: 'post_001' },
      { userId: 'usr_stu_002', postId: 'post_001' },
      { userId: 'usr_stu_003', postId: 'post_001' },
      { userId: 'usr_stu_004', postId: 'post_001' },
      { userId: 'usr_stu_001', postId: 'post_002' },
      { userId: 'usr_stu_002', postId: 'post_002' },
      { userId: 'usr_fac_002', postId: 'post_002' }
    ];

    for (const l of postLikesData) {
      await db.runAsync(`
        INSERT OR IGNORE INTO post_likes (id, user_id, post_id)
        VALUES (?, ?, ?)
      `, [uuidv4(), l.userId, l.postId]);
    }

    // 7. Seed Comments & Replies
    const commentsData = [
      {
        id: 'cmt_001',
        postId: 'post_001',
        userId: 'usr_fac_001',
        parentCommentId: null,
        content: 'Heartiest congratulations to HOD Sir for launching Parvarish! This is a milestone step for official departmental communication.'
      },
      {
        id: 'cmt_002',
        postId: 'post_001',
        userId: 'usr_stu_001',
        parentCommentId: 'cmt_001',
        content: 'Thank you Ma\'am! We are super excited to stay connected directly through this platform.'
      },
      {
        id: 'cmt_003',
        postId: 'post_002',
        userId: 'usr_stu_002',
        parentCommentId: null,
        content: 'Thank you HOD Sir and Dr. Meera Verma for your constant guidance throughout the hackathon!'
      },
      {
        id: 'cmt_004',
        postId: 'post_003',
        userId: 'usr_stu_003',
        parentCommentId: null,
        content: 'Sir, will the seating matrix for mid-terms be updated on the Parvarish app as well?'
      }
    ];

    for (const c of commentsData) {
      await db.runAsync(`
        INSERT OR REPLACE INTO comments (id, post_id, user_id, parent_comment_id, content, status)
        VALUES (?, ?, ?, ?, ?, 'VISIBLE')
      `, [c.id, c.postId, c.userId, c.parentCommentId, c.content]);
    }

    // 8. Seed Events
    const eventsData = [
      {
        id: 'evt_001',
        title: 'Quantum Computing & Post-Quantum Cryptography Workshop',
        description: 'Hands-on 2-day workshop covering quantum algorithms, Qiskit SDK, and post-quantum encryption standards.',
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        eventDate: '2026-09-22',
        eventTime: '10:00 AM - 04:00 PM',
        venue: 'Turing Auditorium, CSE Block',
        organizer: 'Department of CSE & IBM Quantum',
        status: 'UPCOMING'
      },
      {
        id: 'evt_002',
        title: 'Annual Departmental Placement & Career Orientation 2026',
        description: 'Comprehensive session by top recruiters, alumni leaders, and placement officer on coding rounds & interviews.',
        imageUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
        eventDate: '2026-10-05',
        eventTime: '02:00 PM - 05:30 PM',
        venue: 'Main University Convocation Center',
        organizer: 'CSE Placement Cell',
        status: 'UPCOMING'
      },
      {
        id: 'evt_003',
        title: 'InnovateX 2026 Annual Technical Symposium',
        description: 'Departmental project expo, robotics challenge, and keynotes.',
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
        eventDate: '2026-08-20',
        eventTime: '09:00 AM - 06:00 PM',
        venue: 'CSE Department Grounds',
        organizer: 'HOD Office & Student Council',
        status: 'COMPLETED'
      }
    ];

    for (const e of eventsData) {
      await db.runAsync(`
        INSERT OR REPLACE INTO events 
        (id, title, description, image_url, event_date, event_time, venue, organizer, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [e.id, e.title, e.description, e.imageUrl, e.eventDate, e.eventTime, e.venue, e.organizer, e.status, hodId]);
    }

    // 9. Seed Achievements (Wall of Achievements)
    const achievementsData = [
      {
        id: 'ach_001',
        personName: 'Aarav Mehta & Riya Sharma',
        role: 'Final Year Students',
        department: 'Computer Science & Engineering',
        title: '1st Rank — National AI Innovations Hackathon 2026',
        award: 'Gold Trophy & INR 2,50,000 Cash Prize',
        description: 'Developed an autonomous edge-AI solution for agricultural crop diagnosis, defeating 350+ university teams.',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
        achievementDate: '2026-08-25'
      },
      {
        id: 'ach_002',
        personName: 'Dr. Meera Verma',
        role: 'Associate Professor',
        department: 'Computer Science & Engineering',
        title: 'Outstanding Researcher Award in Machine Learning 2026',
        award: 'IEEE Senior Fellowship & Research Grant',
        description: 'Recognized for pioneering work in Federated Learning architectures for privacy-preserving healthcare models.',
        imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
        achievementDate: '2026-07-14'
      },
      {
        id: 'ach_003',
        personName: 'Ananya Roy',
        role: 'Pre-final Year Student',
        department: 'Computer Science & Engineering',
        title: 'Google Generation Anita Borg Scholarship Winner',
        award: 'Scholarship Grant & Mentorship Program',
        description: 'Selected as one of Asia-Pacific\'s top women leaders in computer science for academic excellence and community impact.',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
        achievementDate: '2026-06-10'
      }
    ];

    for (const a of achievementsData) {
      await db.runAsync(`
        INSERT OR REPLACE INTO achievements
        (id, person_name, role, department, title, award, description, image_url, achievement_date, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [a.id, a.personName, a.role, a.department, a.title, a.award, a.description, a.imageUrl, a.achievementDate, hodId]);
    }

    // 10. Seed Notifications
    const notificationsData = [
      {
        id: 'ntf_001',
        userId: 'usr_stu_001',
        type: 'ANNOUNCEMENT',
        title: 'Official Department Welcome',
        message: 'Prof. Dr. A. K. Sharma published a new announcement: Welcome to Parvarish',
        referenceId: 'post_001',
        isRead: 0
      },
      {
        id: 'ntf_002',
        userId: 'usr_stu_001',
        type: 'ACHIEVEMENT',
        title: 'New Achievement Highlighted',
        message: 'Your National Hackathon victory has been published on Parvarish Wall of Achievements!',
        referenceId: 'ach_001',
        isRead: 1
      }
    ];

    for (const n of notificationsData) {
      await db.runAsync(`
        INSERT OR REPLACE INTO notifications (id, user_id, type, title, message, reference_id, is_read)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [n.id, n.userId, n.type, n.title, n.message, n.referenceId, n.isRead]);
    }

    console.log('Parvarish database seeded successfully with official HOD profile, faculty, students, posts, events, achievements, likes, comments, and followers.');
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// Run seed script if executed directly
if (require.main === module) {
  seedData().then(() => process.exit(0));
}

module.exports = seedData;
