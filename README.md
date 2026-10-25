# PARVARISH — Where Every Story Grows 🌿📚

**Parvarish** is an official university/department community mobile application where the **Head of Department (HOD)** serves as the official publishing identity.

---

## 🌟 Key Application Architecture & Product Rules

1. **Official HOD Publishing Identity**:
   - Only the Admin / Head of Department (HOD) account (`Prof. Dr. Anand Kumar Gupta ✓`) can create, publish, edit, pin, and schedule official posts, announcements, events, and wall of achievements.
   - All official posts are published under the HOD Sir's verified identity, not generic "Admin".

2. **Strict Three-Role Model**:
   - **Student**: Explores feed, events, achievements, notifications, comments, replies, reports comments, and follows the HOD profile. **No Create Post controls**.
   - **Faculty**: Connects with departmental updates, comments, replies, and follows HOD profile. **No Create Post controls**. Displayed with "Faculty" badge.
   - **Admin**: Full HOD Admin Dashboard, post editor, media uploader, event manager, wall of achievements, comment moderation queue, user management, and platform analytics.

3. **Server-Side Admin Verification**:
   - Admin access requires passing a server-side verification check (`/api/auth/verify-admin`) against secret `PARVARISH_HOD_2026`. No secrets are exposed to the frontend.

4. **Real Social Dynamics & Persistent Database**:
   - Real social follow system backed by `Follows` table with `follower_id + following_id` unique constraint.
   - Live dynamic counters for Followers, Likes, Comments, and Posts computed directly via SQL queries.

---

## 🚀 How to Run the Application

### 1. Start Backend API Server
```bash
cd backend
npm install
npm run seed
npm start
```
*Backend runs on `http://localhost:5000` with persistent SQLite database.*

### 2. Start Mobile Frontend Application
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000` with simulated mobile device container and responsive view.*

---

## 🧪 Admin Verification Code
- **Default HOD Verification Secret**: `PARVARISH_HOD_2026`
