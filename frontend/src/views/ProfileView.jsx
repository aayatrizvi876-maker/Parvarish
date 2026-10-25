import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  BackIcon, 
  NotificationIcon, 
  DepartmentIcon, 
  UniversityIcon,
  CloseIcon,
  AddIcon
} from '../components/icons/ParvarishIcons';
import { 
  ArrowLeft, 
  Bell, 
  Camera, 
  Edit2, 
  Pencil, 
  Briefcase, 
  GraduationCap, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  X, 
  Quote, 
  LogOut, 
  User, 
  Sparkles,
  Lock,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

const STORAGE_KEY = 'parvarish_profile_custom_v2';

// Golden Hijab Silhouette component from the user's design
export function GoldHijabSilhouette({ className = 'w-full h-full' }) {
  return (
    <div className={`bg-[#091734] flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" className="w-[82%] h-[82%]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hijab Outline */}
        <path
          d="M50 15 C36 15 28 25 28 39 C28 49 30 59 26 69 C23 77 18 83 14 87 C32 89 68 89 86 87 C82 83 77 77 74 69 C70 59 72 49 72 39 C72 25 64 15 50 15 Z"
          fill="#091734"
          stroke="#C5A880"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Face Oval Opening */}
        <path
          d="M50 29 C41 29 36 36 36 47 C36 57 41 63 50 63 C59 63 64 57 64 47 C64 36 59 29 50 29 Z"
          fill="#091734"
          stroke="#C5A880"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Shoulder Drape Accent */}
        <path
          d="M30 71 C42 76 58 76 70 71"
          stroke="#C5A880"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Initial default mock posts matching the user's uploaded mockup
const DEFAULT_USER_POSTS = [
  {
    id: 'usr_post_01',
    type: 'quote',
    title: 'A single piece of paper can change a chapter...',
    content: '“A single piece of paper cannot decide my future, but a single piece of paper can start a new chapter of knowledge and wisdom.”',
    date: 'Sep 28, 2026',
    likesCount: 142,
    commentsCount: 18
  },
  {
    id: 'usr_post_02',
    type: 'image',
    title: 'Distributing certificates to our hard working students...',
    content: 'Proud to present the Academic Excellence awards to the scholars who have shown extraordinary dedication this semester.',
    mediaUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    date: 'Sep 9, 2026',
    likesCount: 98,
    commentsCount: 12
  },
  {
    id: 'usr_post_03',
    type: 'image',
    title: "Parvarish is not only an application... it's our home...",
    content: 'Standing before the central dome during sunset. Parvarish is not only an application... it is our university community home.',
    mediaUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    date: 'Sep 8, 2026',
    likesCount: 231,
    commentsCount: 34
  },
  {
    id: 'usr_post_04',
    type: 'notice',
    title: 'Welcome to the Department of Management Academic Session...',
    content: 'Orientation timetable and seminar schedules are now available at the administrative registry.',
    date: 'Sep 1, 2026',
    likesCount: 76,
    commentsCount: 8
  }
];

export function ProfileView({ 
  onSwitchRole, 
  onOpenPost, 
  onBack, 
  onOpenNotifications, 
  onClose,
  profileUserId 
}) {
  const { user, profileData: authProfileData, updateProfileData, completeProfileSetup, logout } = useAuth();

  // Load custom profile details from AuthContext / localStorage
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not load stored profile:', e);
    }
    return authProfileData || {
      prefix: 'Mr.',
      name: user?.role === 'ADMIN' ? 'Admin' : (user?.name || 'Admin'),
      bio: user?.bio || 'bio',
      department: user?.department || 'Management',
      university: 'United University',
      avatarType: 'custom_image',
      avatarUrl: user?.profileImage || '',
      coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85',
      postsCount: 4,
      followersCount: 0,
      followingCount: 0
    };
  });

  // Keep in sync with AuthContext and window profile events
  useEffect(() => {
    if (authProfileData) {
      setProfileData(prev => ({
        ...prev,
        ...authProfileData
      }));
    }
  }, [authProfileData]);

  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail) {
        setProfileData(prev => ({
          ...prev,
          ...e.detail
        }));
      }
    };
    window.addEventListener('parvarish_profile_sync', handleSync);
    return () => window.removeEventListener('parvarish_profile_sync', handleSync);
  }, []);

  // Active sub-tab: 'posts' | 'comments'
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState(DEFAULT_USER_POSTS);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFocusField, setEditFocusField] = useState('general'); // 'name' | 'bio' | 'academic' | 'avatar' | 'cover'
  const [toastMessage, setToastMessage] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Hidden file inputs for 1-click device gallery selection
  const directAvatarFileRef = useRef(null);
  const directCoverFileRef = useRef(null);

  const handleDirectAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          handleSaveProfile({
            avatarType: 'custom_image',
            avatarUrl: uploadEvent.target.result
          });
          showToast('Profile photo updated from gallery.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDirectCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          handleSaveProfile({
            coverUrl: uploadEvent.target.result
          });
          showToast('Cover photo updated from gallery.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: prev.name || (user.role === 'ADMIN' ? 'Admin' : user.name),
        department: prev.department || user.department || 'Management',
        university: 'United University' // Always fixed to United University
      }));
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveProfile = (updatedFields) => {
    const updated = {
      ...profileData,
      ...updatedFields,
      university: 'United University' // Cannot be changed
    };
    setProfileData(updated);

    // Sync to global AuthContext & broadcast update
    if (updateProfileData) {
      updateProfileData(updated);
    } else {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
    }

    if (completeProfileSetup) {
      completeProfileSetup({
        name: updated.name,
        department: updated.department,
        designation: updated.department,
        bio: updated.bio,
        profileImage: updated.avatarUrl || null,
        coverImage: updated.coverUrl || null
      });
    }

    showToast('Profile updated successfully.');
    setIsEditModalOpen(false);
  };

  const openEditModalWithField = (field) => {
    setEditFocusField(field);
    setIsEditModalOpen(true);
  };

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="flex-1 bg-[#FAF8F5] min-h-screen pb-24 font-sans select-none">
      
      {/* =========================================================================
          TOP NAVIGATION BAR (Exact match to screenshot)
          ========================================================================= */}
      <header className="sticky top-0 bg-[#FAF8F5]/95 backdrop-blur-md z-30 px-4 sm:px-8 py-3.5 border-b border-[#EAE6DF] flex items-center justify-between">
        
        {/* Left: Back Button + Title & Subtitle */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={handleBack}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EFECE6]/80 hover:bg-[#E5E0D8] text-[#091734] flex items-center justify-center transition-all active:scale-95 border border-[#E5E0D8] shadow-2xs"
            title="Go Back"
          >
            <ArrowLeft size={18} className="stroke-[2.2]" />
          </button>

          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#091734] leading-tight tracking-tight">
              My Profile
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Your Account Details
            </p>
          </div>
        </div>

        {/* Right: Edit Profile Button, Notification Bell & User Avatar Pill */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          
          {/* Edit Profile Header Button */}
          <button
            onClick={() => {
              setEditFocusField('general');
              setIsEditModalOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-[#091734] hover:bg-[#15274d] text-[#FFF4DC] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all active:scale-95 border border-amber-300/30"
            title="Edit Profile Details"
          >
            <Pencil size={12} className="text-amber-300" />
            <span>Edit Profile</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => onOpenNotifications && onOpenNotifications()}
            className="w-9 h-9 rounded-full hover:bg-slate-200/60 text-[#091734] flex items-center justify-center transition-colors relative"
            title="Notifications"
          >
            <Bell size={19} className="stroke-[1.8]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {/* User Avatar Circle with Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-1 p-1 rounded-full hover:bg-slate-200/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#091734] border border-amber-300/40 shadow-xs flex items-center justify-center">
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <GoldHijabSilhouette className="w-full h-full" />
                )}
              </div>
              <ChevronDown size={14} className="text-[#091734] opacity-70" />
            </button>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 animate-fadeIn"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{profileData.prefix} {profileData.name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{profileData.department}</p>
                </div>

                <button
                  onClick={() => openEditModalWithField('general')}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-[#091734] flex items-center space-x-2"
                >
                  <Pencil size={13} />
                  <span>Edit Profile</span>
                </button>

                {onSwitchRole && (
                  <button
                    onClick={onSwitchRole}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-[#091734] flex items-center space-x-2"
                  >
                    <User size={13} />
                    <span>Switch Role</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 border-t border-slate-100"
                >
                  <LogOut size={13} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </header>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#091734] text-[#FFF4DC] text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 animate-bounce border border-amber-300/30">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          MAIN PROFILE CONTENT CONTAINER (Exact Layout from Screenshot)
          ========================================================================= */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
        
        {/* 1. Cover Photo Banner Container */}
        <div className="relative w-full h-44 sm:h-64 lg:h-72 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xs bg-slate-900 border border-[#EAE6DF]">
          <img
            src={profileData.coverUrl}
            alt="University Cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85';
            }}
          />

          {/* Hidden File Input for Device Gallery Cover Photo Upload */}
          <input
            type="file"
            ref={directCoverFileRef}
            accept="image/*"
            className="hidden"
            onChange={handleDirectCoverUpload}
          />

          {/* Cover Photo Camera Button (Opens Device Gallery) */}
          <button
            onClick={() => directCoverFileRef.current?.click()}
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 hover:bg-white text-[#091734] shadow-md hover:shadow-lg flex items-center justify-center transition-all active:scale-95 border border-slate-200"
            title="Select Cover Photo from Gallery"
          >
            <Camera size={15} />
          </button>
        </div>

        {/* 2. Overlapping Avatar Section */}
        <div className="relative -mt-16 sm:-mt-20 ml-4 sm:ml-6 flex items-end">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[#FAF8F5] bg-[#091734] overflow-hidden shadow-md">
            {profileData.avatarUrl ? (
              <img src={profileData.avatarUrl} alt={profileData.name} className="w-full h-full object-cover" />
            ) : (
              <GoldHijabSilhouette className="w-full h-full" />
            )}
          </div>

          {/* Hidden File Input for Device Gallery Avatar Upload */}
          <input
            type="file"
            ref={directAvatarFileRef}
            accept="image/*"
            className="hidden"
            onChange={handleDirectAvatarUpload}
          />

          {/* Avatar Camera Button Badge (Opens Device Gallery) */}
          <button
            onClick={() => directAvatarFileRef.current?.click()}
            className="absolute bottom-1 left-18 sm:bottom-1 sm:left-21 w-7 h-7 rounded-full bg-[#EFECE6] hover:bg-[#E0DBD0] border-2 border-[#FAF8F5] text-[#091734] shadow-sm flex items-center justify-center transition-all active:scale-95"
            title="Select Profile Photo from Gallery"
          >
            <Camera size={13} />
          </button>
        </div>

        {/* 3. Name, Prefix & Bio Section */}
        <div className="space-y-1 pt-1">
          {/* Prefix + Name Row */}
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#EFECE6] dark:bg-[#16243D] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-[#E5E0D8] dark:border-[#1F304E]">
              {profileData.prefix || 'Mr.'}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#091734] dark:text-[#F8FAFC] tracking-tight">
              {profileData.name || 'Admin'}
            </h2>
          </div>

          {/* Bio Row */}
          <div className="pt-0.5">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-serif">
              {profileData.bio || 'bio'}
            </p>
          </div>
        </div>

        {/* 4. Academic Info Card (Department & University) */}
        <div className="bg-white/80 dark:bg-[#0F1A2E]/80 rounded-2xl border border-[#EAE6DF] dark:border-[#1F304E] p-4 shadow-2xs">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Department */}
            <div className="flex items-start space-x-2.5 min-w-0 pr-2">
              <Briefcase size={17} className="text-[#091734] dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium block">
                  Department
                </span>
                <span className="font-bold text-sm sm:text-base text-[#091734] dark:text-[#F8FAFC] block truncate">
                  {profileData.department || 'Management'}
                </span>
              </div>
            </div>

            {/* Right: University (Permanently Fixed to United University) */}
            <div className="flex items-start space-x-2.5 border-l border-slate-200/80 dark:border-slate-700 pl-4 min-w-0">
              <GraduationCap size={18} className="text-[#091734] dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium block">
                  University
                </span>
                <span className="font-bold text-sm sm:text-base text-[#091734] dark:text-[#F8FAFC] block truncate">
                  {profileData.university || 'United University'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 5. Dynamic Stats Row (4 Posts, 0 Followers, 0 Following) */}
        <div className="py-2.5 flex items-center justify-around text-center">
          <div className="flex-1">
            <span className="font-serif font-bold text-2xl sm:text-3xl text-[#091734] dark:text-[#F8FAFC] block">
              {posts.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Posts</span>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

          <div className="flex-1">
            <span className="font-serif font-bold text-2xl sm:text-3xl text-[#091734] dark:text-[#F8FAFC] block">
              {profileData.followersCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Followers</span>
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

          <div className="flex-1">
            <span className="font-serif font-bold text-2xl sm:text-3xl text-[#091734] dark:text-[#F8FAFC] block">
              {profileData.followingCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Following</span>
          </div>
        </div>

        {/* 6. Tabs Header: Posts (4) vs Comments (0) */}
        <div className="border-b border-[#EAE6DF] dark:border-[#1F304E] flex space-x-8 pt-2 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-2.5 transition-all relative cursor-pointer ${
              activeTab === 'posts'
                ? 'font-bold text-[#091734] dark:text-[#F8FAFC]'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span>Posts ({posts.length})</span>
            {activeTab === 'posts' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#091734] dark:bg-[#C5A880] rounded-full"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-2.5 transition-all relative cursor-pointer ${
              activeTab === 'comments'
                ? 'font-bold text-[#091734] dark:text-[#F8FAFC]'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <span>Comments (0)</span>
            {activeTab === 'comments' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#091734] dark:bg-[#C5A880] rounded-full"></span>
            )}
          </button>
        </div>

        {/* 7. Tab Panels: Posts Feed List */}
        {activeTab === 'posts' && (
          <div className="bg-white/80 rounded-2xl border border-[#EAE6DF] divide-y divide-[#EAE6DF] overflow-hidden shadow-2xs">
            {posts.map((post) => (
              <div
                key={post.id}
                onClick={() => onOpenPost && onOpenPost(post.id)}
                className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  
                  {/* Post Left Thumbnail */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 bg-[#F4EFE6] border border-[#EAE6DF] flex items-center justify-center">
                    {post.type === 'quote' ? (
                      <div className="w-full h-full bg-[#FAF5EE] flex flex-col items-center justify-center text-amber-800/80 p-2 text-center">
                        <span className="font-serif text-lg leading-none">“ ”</span>
                        <div className="w-6 h-0.5 bg-amber-800/20 mt-1"></div>
                      </div>
                    ) : post.mediaUrl ? (
                      <img
                        src={post.mediaUrl}
                        alt="Post media"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Quote size={20} />
                      </div>
                    )}
                  </div>

                  {/* Post Title & Date */}
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#091734] leading-snug group-hover:text-blue-900 transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      {post.date}
                    </p>
                  </div>

                </div>

                {/* Right Arrow Chevron */}
                <ChevronRight 
                  size={18} 
                  className="text-slate-400 group-hover:text-[#091734] group-hover:translate-x-0.5 transition-all shrink-0 ml-3" 
                />
              </div>
            ))}
          </div>
        )}

        {/* 8. Comments Panel */}
        {activeTab === 'comments' && (
          <div className="bg-white/80 rounded-2xl border border-[#EAE6DF] p-8 text-center shadow-2xs">
            <p className="text-xs text-slate-500 font-serif">
              No comments published yet. When you participate in department posts, your comments will appear here.
            </p>
          </div>
        )}

      </main>

      {/* =========================================================================
          INTERACTIVE PROFILE EDIT MODAL
          ========================================================================= */}
      {isEditModalOpen && (
        <EditProfileModal
          initialData={profileData}
          focusField={editFocusField}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}

    </div>
  );
}

// Full-featured Edit Profile Modal
function EditProfileModal({ initialData, focusField, onClose, onSave }) {
  const [prefix, setPrefix] = useState(initialData.prefix || 'Mr.');
  const [name, setName] = useState(initialData.name || 'Admin');
  const [bio, setBio] = useState(initialData.bio || 'bio');
  const [department, setDepartment] = useState(initialData.department || 'Management');
  const [avatarType, setAvatarType] = useState(initialData.avatarType || 'hijab_silhouette');
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(initialData.coverUrl || '');

  const modalAvatarFileRef = useRef(null);
  const modalCoverFileRef = useRef(null);

  const handleModalAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setAvatarType('custom_image');
          setAvatarUrl(uploadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModalCoverFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setCoverUrl(uploadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const coverPresets = [
    {
      title: 'Neoclassical University Dome',
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85'
    },
    {
      title: 'Centennial Campus Walkway',
      url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=85'
    },
    {
      title: 'Memorial Library Hall',
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=85'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      prefix,
      name: name.trim() || 'Admin',
      bio: bio.trim() || 'bio',
      department: department.trim() || 'Management',
      university: 'United University', // Permanently fixed
      avatarType,
      avatarUrl: avatarUrl.trim(),
      coverUrl: coverUrl.trim() || initialData.coverUrl
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-[#FAF8F5] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-[#EAE6DF] my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#091734] px-6 py-4 text-white flex items-center justify-between border-b border-amber-300/20">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-serif font-bold">
              Account Management
            </span>
            <h3 className="font-serif font-bold text-lg text-[#FFF4DC]">
              Edit Profile Details
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800">
          
          {/* Prefix & Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Title / Prefix & Name
            </label>
            <div className="flex gap-2">
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#091734]"
              >
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
              </select>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#091734]"
                required
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Bio / Designation
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. bio or Head of Department"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#091734]"
            />
          </div>

          {/* Department & University (University is locked to United University) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Management"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#091734]"
              />
            </div>

            {/* University - Permanently Locked */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  University
                </label>
                <span className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1">
                  <Lock size={10} className="text-slate-400" />
                  <span>Fixed Institution</span>
                </span>
              </div>
              <div className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-700 flex items-center justify-between select-none">
                <span className="flex items-center space-x-1.5">
                  <GraduationCap size={14} className="text-[#091734]" />
                  <span>United University</span>
                </span>
                <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded border border-amber-200">Official</span>
              </div>
            </div>
          </div>

          {/* Profile Avatar (Gallery Upload / Official Preset) */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Profile Avatar
              </label>
              <span className="text-[10px] text-slate-400">Select from gallery or official icon</span>
            </div>

            {/* Hidden Input for Avatar File Selection */}
            <input
              type="file"
              ref={modalAvatarFileRef}
              accept="image/*"
              className="hidden"
              onChange={handleModalAvatarFile}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Official Gold Silhouette */}
              <button
                type="button"
                onClick={() => setAvatarType('hijab_silhouette')}
                className={`p-2.5 rounded-2xl border flex items-center space-x-3 transition-all text-left ${
                  avatarType === 'hijab_silhouette' 
                    ? 'border-[#091734] bg-amber-50/80 ring-2 ring-[#091734]' 
                    : 'border-slate-200 hover:border-slate-400 bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#091734] shrink-0 border border-amber-300/40">
                  <GoldHijabSilhouette />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Gold Silhouette</span>
                  <span className="text-[10px] text-slate-500">Official vector avatar</span>
                </div>
              </button>

              {/* Option 2: Choose from Device Gallery */}
              <button
                type="button"
                onClick={() => modalAvatarFileRef.current?.click()}
                className={`p-2.5 rounded-2xl border flex items-center space-x-3 transition-all text-left ${
                  (avatarType === 'custom_url' || avatarType === 'custom_image') && avatarUrl
                    ? 'border-[#091734] bg-amber-50/80 ring-2 ring-[#091734]' 
                    : 'border-dashed border-slate-300 hover:border-[#091734] bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-[#091734] shrink-0 border border-slate-200">
                  {(avatarType === 'custom_url' || avatarType === 'custom_image') && avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={16} />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-800 block truncate">
                    {(avatarType === 'custom_url' || avatarType === 'custom_image') && avatarUrl ? 'Change Photo' : 'Choose from Gallery'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Pick image from device</span>
                </div>
              </button>
            </div>
          </div>

          {/* Cover Photo (Gallery Upload / Campus Presets) */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Cover Photo
              </label>
              <span className="text-[10px] text-slate-400">Select from device gallery or presets</span>
            </div>

            {/* Hidden Input for Cover Photo File Selection */}
            <input
              type="file"
              ref={modalCoverFileRef}
              accept="image/*"
              className="hidden"
              onChange={handleModalCoverFile}
            />

            {/* Gallery Upload Button */}
            <button
              type="button"
              onClick={() => modalCoverFileRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#091734] bg-white flex items-center justify-center space-x-2 text-slate-700 hover:text-[#091734] transition-all group active:scale-98"
            >
              <Upload size={16} className="text-amber-800 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Select Cover Photo from Device Gallery</span>
            </button>

            {/* Live Cover Preview */}
            {coverUrl && (
              <div className="relative rounded-2xl overflow-hidden aspect-[21/9] bg-slate-900 border border-slate-200">
                <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium">
                  Current Selected Cover
                </div>
              </div>
            )}

            {/* Campus Architectural Presets */}
            <div className="pt-1">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1.5">
                Or choose university preset:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {coverPresets.map((preset, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setCoverUrl(preset.url)}
                    className={`rounded-xl overflow-hidden aspect-video border relative group transition-all ${
                      coverUrl === preset.url ? 'ring-2 ring-amber-500 border-amber-500' : 'border-slate-200 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                    {coverUrl === preset.url && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#091734] hover:bg-[#15274d] text-[#FFF4DC] font-bold px-5 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5 border border-amber-300/30"
            >
              <Check size={14} className="text-amber-300" />
              <span>Save Changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
