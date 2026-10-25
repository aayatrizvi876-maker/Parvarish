import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GoldHijabSilhouette } from './ProfileView';
import { 
  ArrowLeft, 
  Bell, 
  ChevronDown, 
  UserCheck, 
  Lock, 
  ShieldCheck, 
  Palette, 
  LogOut, 
  Camera, 
  Landmark, 
  GraduationCap, 
  MapPin, 
  Check, 
  Upload,
  User,
  Key,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Volume2,
  HelpCircle,
  Info,
  Shield,
  X
} from 'lucide-react';

const STORAGE_KEY = 'parvarish_profile_custom_v2';

export function SettingsView({ 
  onBack, 
  onOpenNotifications, 
  onSwitchRole 
}) {
  const { user, profileData: authProfileData, updateProfileData, completeProfileSetup, logout } = useAuth();
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  // Active settings tab
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'password' | 'notifications' | 'privacy' | 'appearance'

  // Help / About / Privacy Modal State
  const [activeModal, setActiveModal] = useState(null); // 'help' | 'about' | 'privacy' | null

  // User Dropdown State
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Hidden file inputs for gallery photo selection
  const fileInputRef = useRef(null);
  const coverFileInputRef = useRef(null);

  // Account Information State (synchronized with ProfileView)
  const [name, setName] = useState('Aayat Rizvi');
  const [role, setRole] = useState('Student Member');
  const [bio, setBio] = useState('Exploring ideas, capturing moments, and being a part of the PARVARISH community. 🌙');
  const [department, setDepartment] = useState('Computer Science');
  const [year, setYear] = useState('3rd Year');
  const university = 'United University'; // Permanently fixed
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarType, setAvatarType] = useState('custom_image'); // 'custom_image' | 'hijab_silhouette'
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85');

  // Password Tab State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Notification Preferences State
  const [notifPreferences, setNotifPreferences] = useState({
    announcements: true,
    events: true,
    magazine: true,
    videos: false,
    emailDigest: true
  });

  // Privacy & Security Preferences State
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: true,
    showEmail: false,
    twoFactorAuth: false
  });

  // Appearance State
  const [selectedTheme, setSelectedTheme] = useState('navy_cream');

  // Load initial settings from localStorage / AuthContext & listen for live sync
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName(parsed.name);
        if (parsed.bio !== undefined) setBio(parsed.bio);
        if (parsed.department) setDepartment(parsed.department);
        if (parsed.year) setYear(parsed.year);
        if (parsed.avatarUrl !== undefined) setAvatarUrl(parsed.avatarUrl);
        if (parsed.avatarType) setAvatarType(parsed.avatarType);
        if (parsed.coverUrl !== undefined) setCoverUrl(parsed.coverUrl);
      } else if (authProfileData) {
        if (authProfileData.name) setName(authProfileData.name);
        if (authProfileData.bio !== undefined) setBio(authProfileData.bio);
        if (authProfileData.department) setDepartment(authProfileData.department);
        if (authProfileData.avatarUrl !== undefined) setAvatarUrl(authProfileData.avatarUrl);
        if (authProfileData.coverUrl !== undefined) setCoverUrl(authProfileData.coverUrl);
      } else if (user) {
        setName(user.name || 'Aayat Rizvi');
        setDepartment(user.department || 'Computer Science');
        if (user.bio) setBio(user.bio);
        if (user.profileImage) {
          setAvatarUrl(user.profileImage);
          setAvatarType('custom_image');
        }
      }

      if (user?.role === 'ADMIN') {
        setRole('Head of Department (Admin)');
      } else if (user?.role === 'FACULTY') {
        setRole('Faculty Member');
      } else {
        setRole('Student Member');
      }
    } catch (e) {
      console.warn('Failed to load settings data:', e);
    }
  }, [user, authProfileData]);

  // Live real-time bidirectional sync listener with ProfileView
  useEffect(() => {
    const handleSync = (e) => {
      const detail = e.detail;
      if (detail) {
        if (detail.name) setName(detail.name);
        if (detail.bio !== undefined) setBio(detail.bio);
        if (detail.department) setDepartment(detail.department);
        if (detail.year) setYear(detail.year);
        if (detail.avatarUrl !== undefined) setAvatarUrl(detail.avatarUrl);
        if (detail.avatarType) setAvatarType(detail.avatarType);
        if (detail.coverUrl !== undefined) setCoverUrl(detail.coverUrl);
      }
    };

    window.addEventListener('parvarish_profile_sync', handleSync);
    return () => window.removeEventListener('parvarish_profile_sync', handleSync);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle Profile Photo selection from device gallery
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const newAvatar = uploadEvent.target.result;
          setAvatarUrl(newAvatar);
          setAvatarType('custom_image');

          // Immediately sync with ProfileView and AuthContext
          if (updateProfileData) {
            updateProfileData({
              avatarUrl: newAvatar,
              avatarType: 'custom_image'
            });
          }
          showToast('Profile photo updated & synced with Profile!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Cover Photo selection from device gallery
  const handleCoverPhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Cover photo size must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          const newCover = uploadEvent.target.result;
          setCoverUrl(newCover);

          // Immediately sync with ProfileView and AuthContext
          if (updateProfileData) {
            updateProfileData({
              coverUrl: newCover
            });
          }
          showToast('Cover photo updated & synced with Profile!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Account Information
  const handleSaveAccountInfo = (e) => {
    if (e) e.preventDefault();

    try {
      const updated = {
        name: name.trim() || 'Aayat Rizvi',
        bio: bio.trim(),
        department: department.trim() || 'Computer Science',
        year,
        university: 'United University',
        avatarUrl,
        avatarType,
        coverUrl
      };

      if (updateProfileData) {
        updateProfileData(updated);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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

      showToast('Account details, profile, and cover photo updated successfully.');
    } catch (err) {
      showToast('Failed to save settings.');
    }
  };

  // Save Password
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password changed successfully.');
  };

  // Settings menu navigation items
  const menuItems = [
    { id: 'account', label: 'Account Information', icon: UserCheck },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <div className="flex-1 bg-[#FAF8F5] min-h-screen pb-24 font-sans select-none">
      
      {/* =========================================================================
          TOP NAVIGATION BAR (Exact match to screenshot)
          ========================================================================= */}
      <header className="sticky top-0 bg-[#FAF8F5]/95 backdrop-blur-md z-30 px-4 sm:px-8 py-3.5 border-b border-[#EAE6DF] flex items-center justify-between">
        
        {/* Left: Back Button + Title & Subtitle */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={() => onBack ? onBack() : window.history.back()}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EFECE6]/80 hover:bg-[#E5E0D8] text-[#091734] flex items-center justify-center transition-all active:scale-95 border border-[#E5E0D8] shadow-2xs"
            title="Go Back"
          >
            <ArrowLeft size={18} className="stroke-[2.2]" />
          </button>

          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#091734] leading-tight tracking-tight">
              Settings
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Manage your account and preferences
            </p>
          </div>
        </div>

        {/* Right: Notification Bell & User Avatar Pill */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* Notification Bell */}
          <button
            onClick={() => onOpenNotifications && onOpenNotifications()}
            className="w-9 h-9 rounded-full hover:bg-slate-200/60 text-[#091734] flex items-center justify-center transition-colors relative"
            title="Notifications"
          >
            <Bell size={19} className="stroke-[1.8]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
          </button>

          {/* User Avatar Circle with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-1 p-1 rounded-full hover:bg-slate-200/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#091734] border border-amber-300/40 shadow-xs flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
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
                  <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
                  <p className="text-[10px] text-slate-500 truncate">{department}</p>
                </div>

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
          MAIN SETTINGS LAYOUT (2 Columns: Left Menu, Right Content Panel)
          ========================================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Left Sub-Navigation Menu */}
          <nav className="w-full md:w-64 lg:w-72 shrink-0 space-y-1 bg-white/60 dark:bg-[#0F1A2E]/80 p-2 sm:p-2.5 rounded-2xl border border-[#EAE6DF] dark:border-[#1F304E] shadow-2xs">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs sm:text-sm transition-all text-left group cursor-pointer ${
                    isActive
                      ? 'settings-subnav-active font-bold border-l-4 border-[#C5A880] shadow-2xs'
                      : 'text-slate-600 dark:text-[#CBD5E1] hover:text-[#0B1B3A] dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#16243D] font-medium'
                  }`}
                  style={isActive ? {
                    backgroundColor: '#F5EEDC',
                    color: '#0B1B3A'
                  } : {}}
                >
                  <Icon 
                    size={18} 
                    className={isActive ? 'settings-subnav-icon-active' : 'text-slate-500 dark:text-[#94A3B8] group-hover:text-[#0B1B3A] dark:group-hover:text-white'} 
                    style={isActive ? { color: '#0B1B3A' } : {}}
                  />
                  <span style={isActive ? { color: '#0B1B3A' } : {}}>{item.label}</span>
                </button>
              );
            })}

            {/* Help, About & Privacy Quick Links */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-[#1F304E] mt-2 space-y-1">
              <button
                type="button"
                onClick={() => setActiveModal('help')}
                className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] hover:text-[#0B1B3A] dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#16243D] transition-all font-medium text-left group cursor-pointer"
              >
                <HelpCircle size={18} className="text-amber-800 dark:text-amber-400 shrink-0 group-hover:scale-105 transition-transform" />
                <span>Help Center</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('about')}
                className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] hover:text-[#0B1B3A] dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#16243D] transition-all font-medium text-left group cursor-pointer"
              >
                <Info size={18} className="text-blue-900 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform" />
                <span>About Parvarish</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] hover:text-[#0B1B3A] dark:hover:text-white hover:bg-white/80 dark:hover:bg-[#16243D] transition-all font-medium text-left group cursor-pointer"
              >
                <Shield size={18} className="text-emerald-800 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition-transform" />
                <span>Privacy Policy</span>
              </button>
            </div>

            {/* Log Out Action in Sidebar Menu (In a Red Box) */}
            <div className="pt-2.5 border-t border-slate-200/80 dark:border-[#1F304E] mt-2.5">
              <button
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs border border-rose-700 transition-all active:scale-95 text-left cursor-pointer"
              >
                <LogOut size={18} className="text-white shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          </nav>

          {/* Right Main Content Panel */}
          <div className="flex-1 w-full">
            
            {/* ===============================================================
                1. ACCOUNT INFORMATION PANEL (Exact match to screenshot)
                =============================================================== */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-xs space-y-6">
                
                {/* Panel Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#091734]">
                      Account Information
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Update your personal details and profile information.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveAccountInfo}
                    className="bg-[#091734] hover:bg-[#15274d] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 border border-amber-300/30 self-start sm:self-auto"
                  >
                    Save Changes
                  </button>
                </div>

                {/* 1. Cover Photo Row */}
                <div className="space-y-2.5 pb-5 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 font-serif">
                        Cover Photo
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Wide landscape banner for your profile header (JPG, PNG, WEBP).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="bg-[#091734] hover:bg-[#15274d] text-[#FFF4DC] font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-2xs transition-all active:scale-95 border border-amber-300/30 cursor-pointer"
                    >
                      <Camera size={13} className="text-amber-300" />
                      <span>Change Cover</span>
                    </button>
                  </div>

                  {/* Hidden file input for cover */}
                  <input 
                    type="file" 
                    ref={coverFileInputRef} 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleCoverPhotoUpload} 
                  />

                  {/* Live Cover Preview Banner */}
                  <div className="relative w-full h-32 sm:h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-900 group">
                    <img 
                      src={coverUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85'} 
                      alt="Cover Preview" 
                      className="w-full h-full object-cover transition-transform group-hover:scale-[1.01]" 
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85';
                      }}
                    />
                    
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="absolute bottom-2.5 right-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-xl font-medium flex items-center space-x-1.5 border border-white/20 shadow-md transition-all cursor-pointer"
                    >
                      <Camera size={13} />
                      <span>Upload from Gallery</span>
                    </button>
                  </div>
                </div>

                {/* 2. Profile Picture Row */}
                <div className="flex items-center space-x-5 pt-1">
                  
                  {/* Avatar Circle with Camera Overlay */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-white shadow-md bg-[#091734] shrink-0 cursor-pointer group"
                    title="Click to Change Photo"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <GoldHijabSilhouette className="w-full h-full" />
                    )}

                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera size={18} />
                    </div>

                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#091734] text-white flex items-center justify-center border border-white shadow-xs">
                      <Camera size={12} />
                    </div>
                  </div>

                  {/* Photo Info & Change Button */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 font-serif">
                      Profile Picture
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      JPG, PNG or WEBP. Max size 5MB.
                    </p>

                    {/* Hidden file input */}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handlePhotoUpload} 
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2.5 bg-[#FFF8EE] hover:bg-[#FAF0E0] border border-[#E8DEC8] text-slate-800 font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 shadow-2xs transition-all active:scale-95 cursor-pointer"
                    >
                      <Camera size={13} className="text-[#091734]" />
                      <span>Change Photo</span>
                    </button>
                  </div>
                </div>

                {/* Form Inputs Grid */}
                <form onSubmit={handleSaveAccountInfo} className="space-y-4 pt-2">
                  
                  {/* Row 1: Name & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Full Name"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#091734] focus:ring-1 focus:ring-[#091734]"
                        required
                      />
                    </div>

                    {/* Role (Read-only) */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Role
                      </label>
                      <input
                        type="text"
                        value={role}
                        readOnly
                        className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed select-none"
                      />
                    </div>
                  </div>

                  {/* Row 2: Bio */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Bio
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        maxLength={200}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write a brief bio about yourself..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-[#091734] focus:ring-1 focus:ring-[#091734] leading-relaxed resize-none"
                      />
                      <span className="absolute bottom-2.5 right-3 text-[10px] text-slate-400 font-mono">
                        {bio.length}/200
                      </span>
                    </div>
                  </div>

                  {/* Row 3: Department & Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Department */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Department
                      </label>
                      <div className="relative flex items-center">
                        <Landmark size={15} className="absolute left-3.5 text-[#091734] pointer-events-none" />
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="e.g. Computer Science"
                          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#091734] focus:ring-1 focus:ring-[#091734]"
                        />
                      </div>
                    </div>

                    {/* Year */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Year
                      </label>
                      <div className="relative flex items-center">
                        <GraduationCap size={16} className="absolute left-3.5 text-[#091734] pointer-events-none" />
                        <select
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-8 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#091734] appearance-none"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="Graduate / Alumni">Graduate / Alumni</option>
                          <option value="Faculty / Staff">Faculty / Staff</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3.5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: University (Permanently Fixed to United University) */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      University
                    </label>
                    <div className="relative flex items-center">
                      <MapPin size={15} className="absolute left-3.5 text-[#091734] pointer-events-none" />
                      <input
                        type="text"
                        value={university}
                        readOnly
                        className="w-full bg-slate-100/90 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-400 cursor-not-allowed select-none"
                      />
                    </div>
                  </div>

                </form>

              </div>
            )}

            {/* ===============================================================
                2. CHANGE PASSWORD PANEL
                =============================================================== */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#091734]">
                    Change Password
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Update your account password for enhanced security.
                  </p>
                </div>

                <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Current Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#091734]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#091734]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#091734]"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id="showPass"
                      checked={showPassword}
                      onChange={() => setShowPassword(!showPassword)}
                      className="rounded text-[#091734] focus:ring-0"
                    />
                    <label htmlFor="showPass" className="text-xs text-slate-600 font-medium cursor-pointer">
                      Show passwords
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="mt-4 bg-[#091734] hover:bg-[#15274d] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {/* ===============================================================
                3. NOTIFICATIONS PREFERENCES PANEL
                =============================================================== */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#091734]">
                    Notification Preferences
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Select the notifications you want to receive across the campus network.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'announcements', title: 'Official Campus Notices & Circulars', desc: 'Alerts regarding university schedule, registry notices, and exams.' },
                    { key: 'events', title: 'Conferences, Symposiums & Workshops', desc: 'Notifications about upcoming guest lectures and cultural galas.' },
                    { key: 'magazine', title: 'Magazine Archival Photo Releases', desc: 'Updates when new curated photographic editions are published.' },
                    { key: 'videos', title: 'Video Lounge Live Streams & Broadcasts', desc: 'Alerts when symposium video recordings are uploaded.' },
                    { key: 'emailDigest', title: 'Weekly Digest Email', desc: 'Summary of the most inspiring campus stories sent to your inbox.' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifPreferences[item.key]}
                        onChange={() => {
                          setNotifPreferences(prev => ({ ...prev, [item.key]: !prev[item.key] }));
                          showToast('Notification preference saved.');
                        }}
                        className="w-4 h-4 text-[#091734] rounded focus:ring-0 cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===============================================================
                4. PRIVACY & SECURITY PANEL
                =============================================================== */}
            {activeTab === 'privacy' && (
              <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-100">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#091734]">
                    Privacy & Security
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Control who can see your profile and manage account security.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Public Profile Visibility</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Allow other students and faculty to view your profile and articles.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.publicProfile}
                      onChange={() => {
                        setPrivacySettings(prev => ({ ...prev, publicProfile: !prev.publicProfile }));
                        showToast('Privacy settings updated.');
                      }}
                      className="w-4 h-4 text-[#091734] rounded focus:ring-0 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Show Institutional Email</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Display your campus email on your public profile card.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showEmail}
                      onChange={() => {
                        setPrivacySettings(prev => ({ ...prev, showEmail: !prev.showEmail }));
                        showToast('Email visibility updated.');
                      }}
                      className="w-4 h-4 text-[#091734] rounded focus:ring-0 cursor-pointer"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <ShieldCheck size={16} className="text-amber-800" />
                        <h4 className="text-xs font-bold text-slate-900">Institutional Session Protection</h4>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Your session is secured via official Google OAuth and JWT encryption.</p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ===============================================================
                5. APPEARANCE & DARK MODE PANEL
                =============================================================== */}
            {activeTab === 'appearance' && (
              <div className="bg-white rounded-3xl border border-[#EAE6DF] p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
                <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#091734]">
                      Appearance & Theme
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Customize your visual atmosphere, light & dark appearance, and reading comfort.
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold font-serif tracking-wider uppercase border flex items-center space-x-1.5 bg-[#FAF8F5] border-amber-200 text-[#091734]">
                    {isDark ? <Moon size={13} className="text-amber-400" /> : <Sun size={13} className="text-amber-600" />}
                    <span>{isDark ? 'Dark Active' : 'Light Active'}</span>
                  </div>
                </div>

                {/* Quick Mode Toggle Pill Bar */}
                <div className="p-1.5 bg-slate-100 rounded-2xl flex items-center gap-1.5 max-w-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setTheme('light');
                      showToast('Light Mode (Classic Parvarish) activated');
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !isDark
                        ? 'bg-white text-[#091734] shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sun size={16} className={!isDark ? 'text-amber-600' : 'text-slate-400'} />
                    <span>Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTheme('dark');
                      showToast('Dark Mode (Midnight Onyx) activated');
                    }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isDark
                        ? 'bg-[#091734] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Moon size={16} className={isDark ? 'text-amber-300' : 'text-slate-400'} />
                    <span>Dark Mode</span>
                  </button>
                </div>

                {/* Visual Theme Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  
                  {/* Theme 1: Classic Light */}
                  <div 
                    onClick={() => {
                      setTheme('light');
                      showToast('Classic Navy & Cream theme active.');
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all relative ${
                      !isDark 
                        ? 'border-[#091734] bg-amber-50/50 ring-2 ring-[#091734] shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-[#091734] shadow-2xs"></div>
                        <div className="w-5 h-5 rounded-full bg-[#FAF8F5] border border-amber-300 shadow-2xs"></div>
                        <div className="w-5 h-5 rounded-full bg-[#C5A880] shadow-2xs"></div>
                      </div>
                      {!isDark && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Active
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#091734]">Classic Parvarish (Light)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Oxford navy blue typography, warm cream paper background, and regal gold accents.
                    </p>
                  </div>

                  {/* Theme 2: Midnight Dark */}
                  <div 
                    onClick={() => {
                      setTheme('dark');
                      showToast('Midnight Onyx Dark Mode active.');
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all relative ${
                      isDark 
                        ? 'border-[#091734] bg-slate-900/10 ring-2 ring-[#C5A880] shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-[#070D19] border border-slate-700 shadow-2xs"></div>
                        <div className="w-5 h-5 rounded-full bg-[#16243D] border border-slate-600 shadow-2xs"></div>
                        <div className="w-5 h-5 rounded-full bg-[#F59E0B] shadow-2xs"></div>
                      </div>
                      {isDark && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                          Active
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#091734]">Midnight Parvarish (Dark)</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Deep obsidian background, low-light slate cards, and high-contrast typography designed for night study.
                    </p>
                  </div>

                </div>

                {/* Live Preview Card */}
                <div className="p-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-serif">
                      Live Interface Atmosphere Preview
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Applied instantly across all pages
                    </span>
                  </div>
                  <div className={`p-4 rounded-xl border transition-all ${
                    isDark ? 'bg-[#0F1A2E] border-[#1F304E] text-[#F8FAFC]' : 'bg-white border-[#EAE6DF] text-[#091734]'
                  }`}>
                    <div className="flex items-center space-x-2.5 mb-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold">
                        P
                      </div>
                      <span className="text-xs font-bold">Parvarish University Social Magazine</span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                      Where Every Story Grows. Ideas Today, A Stronger Tomorrow.
                    </p>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

        {/* =========================================================================
            HELP CENTER, ABOUT PARVARISH & PRIVACY POLICY BAR (Under Settings)
            ========================================================================= */}
        <div className="mt-8 pt-5 border-t border-[#EAE6DF] dark:border-[#1F304E] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-[#94A3B8] font-serif">
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-6">
            <button
              onClick={() => setActiveModal('help')}
              className="flex items-center space-x-2 text-slate-600 dark:text-[#CBD5E1] hover:text-[#0B1B3A] dark:hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-200/50 dark:hover:bg-[#16243D] text-xs sm:text-sm font-medium cursor-pointer"
            >
              <HelpCircle size={18} className="text-amber-800 dark:text-amber-400 shrink-0" />
              <span>Help Center</span>
            </button>

            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

            <button
              onClick={() => setActiveModal('about')}
              className="flex items-center space-x-2 text-slate-600 dark:text-[#CBD5E1] hover:text-[#0B1B3A] dark:hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-200/50 dark:hover:bg-[#16243D] text-xs sm:text-sm font-medium cursor-pointer"
            >
              <Info size={18} className="text-blue-900 dark:text-blue-400 shrink-0" />
              <span>About Parvarish</span>
            </button>

            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

            <button
              onClick={() => setActiveModal('privacy')}
              className="flex items-center space-x-2 text-slate-600 dark:text-[#CBD5E1] hover:text-[#0B1B3A] dark:hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-200/50 dark:hover:bg-[#16243D] text-xs sm:text-sm font-medium cursor-pointer"
            >
              <Shield size={18} className="text-emerald-800 dark:text-emerald-400 shrink-0" />
              <span>Privacy Policy</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500 font-sans tracking-wide">
            United University Social Magazine • Vol. IV (2026)
          </div>

        </div>

      </main>

      {/* =========================================================================
          HELP CENTER / ABOUT / PRIVACY MODAL OVERLAYS
          ========================================================================= */}
      {activeModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
          onClick={() => setActiveModal(null)}
        >
          <div 
            className={`${activeModal === 'about' ? 'bg-white dark:bg-[#070D19]' : 'bg-[#FAF8F5] dark:bg-[#0F1A2E]'} rounded-3xl w-full ${activeModal === 'privacy' ? 'max-w-3xl' : 'max-w-xl'} overflow-hidden shadow-2xl border border-[#EAE6DF] dark:border-[#1F304E] my-8 flex flex-col max-h-[85vh] transition-all`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {activeModal === 'about' ? (
              <div className="bg-white dark:bg-[#070D19] px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveModal(null)}
                    className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-[#091734] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#091734] dark:text-[#F8FAFC]">
                    About Parvarish
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="bg-[#091734] px-6 py-4 text-white flex items-center justify-between border-b border-amber-300/20">
                <div className="flex items-center space-x-2.5">
                  {activeModal === 'help' && <HelpCircle size={20} className="text-amber-300" />}
                  {activeModal === 'privacy' && <Shield size={20} className="text-amber-300" />}
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-serif font-bold block">
                      United University Official
                    </span>
                    <h3 className="font-serif font-bold text-lg text-[#FFF4DC]">
                      {activeModal === 'help' && 'PARVARISH Help Center'}
                      {activeModal === 'privacy' && 'Privacy Policy & End User License Agreement'}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className={`p-6 overflow-y-auto flex-1 space-y-4 text-slate-800 dark:text-slate-200 text-xs leading-relaxed font-sans ${activeModal === 'about' ? 'bg-white dark:bg-[#070D19]' : ''}`}>
              {activeModal === 'help' && (
                <div className="space-y-4 font-serif">
                  <p className="text-slate-600 dark:text-slate-300 italic">
                    Welcome to the official PARVARISH Help & Guidance Desk. Find quick answers regarding campus publication, account verification, and media submissions.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="p-3.5 bg-white dark:bg-[#13213B] rounded-2xl border border-[#EAE6DF] dark:border-[#1F304E]">
                      <h4 className="font-bold text-slate-900 dark:text-[#F8FAFC] text-xs">How do I publish articles or images?</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                        Students can submit article drafts for department review, while designated Department Admins (HODs) have direct publishing access from the Admin Studio dashboard.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-[#13213B] rounded-2xl border border-[#EAE6DF] dark:border-[#1F304E]">
                      <h4 className="font-bold text-slate-900 dark:text-[#F8FAFC] text-xs">Who can publish videos in the Video Lounge?</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                        Only verified university administrators can publish video streams. Videos are embedded directly from official YouTube URLs (lectures, symposiums, convocation).
                      </p>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-[#13213B] rounded-2xl border border-[#EAE6DF] dark:border-[#1F304E]">
                      <h4 className="font-bold text-slate-900 dark:text-[#F8FAFC] text-xs">How do I verify my role as HOD or Faculty?</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                        Role verification requires an authorized departmental access code provided by PARVARISH application owner and admins.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white dark:bg-[#13213B] rounded-2xl border border-[#EAE6DF] dark:border-[#1F304E]">
                      <h4 className="font-bold text-slate-900 dark:text-[#F8FAFC] text-xs">Need technical support?</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                        Contact the support team at <strong className="text-[#091734] dark:text-amber-400">support@parvarish.united.edu</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'about' && (
                <div className="py-6 px-4 sm:px-8 text-center flex flex-col items-center justify-center space-y-6">
                  {/* Circular Dark Navy Badge with P */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#0d2a5c] flex items-center justify-center shadow-lg border-2 border-amber-400/40">
                    <span className="text-white text-5xl sm:text-6xl font-serif font-bold select-none leading-none pt-0.5">
                      P
                    </span>
                  </div>

                  {/* Brand Name - No version */}
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#091734] dark:text-[#F8FAFC] tracking-tight">
                      Parvarish
                    </h2>
                  </div>

                  {/* Description Paragraph */}
                  <p className="text-[#152e5a] dark:text-[#CBD5E1] font-serif text-sm sm:text-base leading-relaxed max-w-md mx-auto text-center px-2">
                    Parvarish is a personal digital platform to share the photos, videos, achievements, memories, thoughts, and important updates in one place. It creates a simple and engaging space to preserve special moments while staying connected with students, colleagues, and followers.
                  </p>

                  {/* Developed By MARS */}
                  <div className="pt-6 sm:pt-8 text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-sans tracking-wide">
                      Developed by
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-[#091734] dark:text-amber-400 tracking-wider mt-0.5 font-sans">
                      MARS
                    </div>
                  </div>

                  {/* Footer Copyright */}
                  <div className="pt-6 text-xs text-slate-400 dark:text-slate-500 font-sans text-center">
                    © 2026 Parvarish. All rights reserved.
                  </div>
                </div>
              )}

              {activeModal === 'privacy' && (
                <div className="space-y-6 font-sans text-xs text-slate-700 leading-relaxed">
                  
                  {/* Top Document Header Banner */}
                  <div className="bg-white p-5 rounded-2xl border border-[#EAE6DF] shadow-2xs text-center space-y-1">
                    <span className="text-[11px] font-bold tracking-widest uppercase text-[#9A6B38] font-serif">
                      Official Institutional Document
                    </span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#091734]">
                      PARVARISH
                    </h2>
                    <h3 className="text-sm font-semibold text-slate-800">
                      Privacy Policy & End User License Agreement
                    </h3>
                    <p className="text-[11px] text-slate-500 pt-1 font-serif">
                      Last Updated: October 25, 2026
                    </p>
                  </div>

                  {/* =========================================================================
                      PART I — PRIVACY POLICY
                      ========================================================================= */}
                  <div className="space-y-4">
                    <div className="bg-[#091734] text-[#FFF4DC] px-4 py-2.5 rounded-xl font-serif font-bold text-sm tracking-wide shadow-2xs">
                      PART I — PRIVACY POLICY
                    </div>

                    {/* Section 1 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">1. Introduction</h4>
                      <p>
                        <strong>PARVARISH — The Official University Social Magazine</strong> is a university community platform for academic announcements, campus photography, educational videos, and student achievements.
                      </p>
                      <p className="text-slate-600">
                        This Privacy Policy explains how information may be collected, used, stored, and protected when you use the platform.
                      </p>
                    </div>

                    {/* Section 2 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-2 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">2. Information We Collect</h4>
                      <p className="text-slate-600">
                        Depending on the features implemented, PARVARISH may process the following information:
                      </p>
                      <ul className="space-y-1.5 pl-2">
                        <li>
                          • <strong className="text-slate-800">Account information:</strong> Name, email address, profile picture, biography, university, department, academic year, and account role.
                        </li>
                        <li>
                          • <strong className="text-slate-800">User-generated content:</strong> Posts, comments, photographs, and other content submitted through available features.
                        </li>
                        <li>
                          • <strong className="text-slate-800">Platform activity:</strong> Bookmarks, following information, and interactions with platform features, where enabled.
                        </li>
                        <li>
                          • <strong className="text-slate-800">Technical information:</strong> IP address, browser details, session information, access timestamps, and security logs, where collected.
                        </li>
                      </ul>
                    </div>

                    {/* Section 3 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-2 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">3. How We Use Information</h4>
                      <p className="text-slate-600">Information may be used to:</p>
                      <ul className="space-y-1 pl-2">
                        <li>• Create and manage user accounts.</li>
                        <li>• Display profiles and academic information.</li>
                        <li>• Deliver announcements, photographs, and educational videos.</li>
                        <li>• Enforce account permissions and protect administrative functions.</li>
                        <li>• Maintain platform security and prevent unauthorized access.</li>
                        <li>• Troubleshoot errors and improve performance.</li>
                        <li>• Comply with applicable legal obligations.</li>
                      </ul>
                    </div>

                    {/* Section 4 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">4. Visibility of Information</h4>
                      <p>
                        Names, profile pictures, biographies, academic details, and published content may be visible to other users according to the platform's settings.
                      </p>
                      <p>
                        Email addresses, authentication credentials, and other account-security information should be restricted to authorized systems and personnel.
                      </p>
                      <p className="text-slate-500 italic">
                        Users should avoid including sensitive personal information in public profiles or posts.
                      </p>
                    </div>

                    {/* Section 5 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">5. Administrator Access</h4>
                      <p>
                        Only authorized administrators may create, publish, edit, or remove official content, according to their assigned permissions.
                      </p>
                      <p>
                        Students may view published content and use the features available to their accounts. Administrative access must be restricted to authorized personnel and used for legitimate platform purposes.
                      </p>
                    </div>

                    {/* Section 6 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">6. Data Storage and Security</h4>
                      <p>
                        PARVARISH is initially being developed in a local environment, with Supabase planned for authentication, database management, and file storage.
                      </p>
                      <p>
                        When the relevant services are integrated, information may be stored and processed through the configured infrastructure.
                      </p>
                      <p>
                        We intend to implement appropriate safeguards, including authentication, role-based access controls, database permissions, and restrictions on file access. However, no electronic system can guarantee absolute security.
                      </p>
                    </div>

                    {/* Section 7 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-2 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">7. Third-Party Services</h4>
                      <p className="text-slate-600">
                        PARVARISH may use third-party services to provide authentication, storage, video playback, hosting, and other functionality. The services actually used will depend on the final application configuration.
                      </p>
                      <ul className="space-y-2 pl-2">
                        <li>
                          • <strong className="text-slate-900">Supabase:</strong> May provide authentication, database management, and file storage.{' '}
                          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] hover:underline font-medium">
                            [Privacy Policy]
                          </a>
                        </li>
                        <li>
                          • <strong className="text-slate-900">YouTube and Google:</strong> May provide embedded video playback and related services. Interacting with embedded videos may allow these providers to process information under their own policies.{' '}
                          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] hover:underline font-medium">
                            [Google Privacy Policy]
                          </a>
                        </li>
                        <li>
                          • <strong className="text-slate-900">Hosting and infrastructure providers:</strong> May process technical information necessary to host, deliver, maintain, or secure the website.
                        </li>
                      </ul>
                      <p className="text-slate-500 italic text-[11px] pt-1">
                        These providers operate under their own terms and privacy policies. PARVARISH does not control their independent data practices.
                      </p>
                    </div>

                    {/* Section 8 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">8. Cookies and Similar Technologies</h4>
                      <p>
                        Cookies or similar technologies may be used for authentication, session management, security, and user preferences. If additional analytics or tracking technologies are introduced, their use will be disclosed and consent obtained where required by applicable law.
                      </p>
                    </div>

                    {/* Section 9 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">9. Data Retention and User Rights</h4>
                      <p>
                        Information will be retained only for as long as reasonably necessary for the purposes described in this policy, subject to applicable legal obligations.
                      </p>
                      <p>
                        Depending on applicable law, users may request access to, correction of, or deletion of their personal information. Requests will be handled through the procedures made available by the platform operator.
                      </p>
                      <p>
                        Deleting an account may not remove content already shared with other users or information that must be retained for legitimate legal purposes.
                      </p>
                    </div>

                    {/* Section 10 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">10. Children's Privacy</h4>
                      <p>
                        PARVARISH is intended for university communities and is not specifically designed for young children. Appropriate steps will be taken if we become aware of unlawful collection of children's personal information.
                      </p>
                    </div>

                    {/* Section 11 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">11. Changes to This Policy</h4>
                      <p>
                        This Privacy Policy may be updated when the platform's features, data practices, or legal requirements change. The revised version will be published with an updated date, and significant changes will be communicated where required.
                      </p>
                    </div>
                  </div>

                  {/* =========================================================================
                      PART II — END USER LICENSE AGREEMENT (EULA)
                      ========================================================================= */}
                  <div className="space-y-4 pt-2">
                    <div className="bg-[#091734] text-[#FFF4DC] px-4 py-2.5 rounded-xl font-serif font-bold text-sm tracking-wide shadow-2xs">
                      PART II — END USER LICENSE AGREEMENT (EULA)
                    </div>

                    {/* Section 12 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">12. Acceptance of Terms</h4>
                      <p>
                        By accessing or using PARVARISH, you agree to this agreement and applicable laws. If you do not agree, you should discontinue using the platform. Explicit acceptance will be obtained where legally required.
                      </p>
                    </div>

                    {/* Section 13 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">13. License to Use</h4>
                      <p>
                        PARVARISH grants users a limited, non-exclusive, non-transferable, and revocable license to use the platform for its intended educational and university-community purposes.
                      </p>
                      <p>
                        This license does not transfer ownership of the platform, its software, branding, or intellectual property.
                      </p>
                    </div>

                    {/* Section 14 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">14. Account Responsibilities</h4>
                      <p>
                        Users must provide accurate information where required, protect their login credentials, and report suspected unauthorized access.
                      </p>
                      <p>
                        Users must not share or use accounts in ways that compromise security or bypass assigned permissions.
                      </p>
                    </div>

                    {/* Section 15 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-2 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">15. Acceptable Use</h4>
                      <p className="text-slate-600">Users must not:</p>
                      <ul className="space-y-1 pl-2 text-rose-900/90 font-medium">
                        <li>• Publish unlawful, abusive, fraudulent, or harmful content.</li>
                        <li>• Impersonate another person or misrepresent academic affiliation.</li>
                        <li>• Bypass authentication or security controls.</li>
                        <li>• Access, modify, or delete information without authorization.</li>
                        <li>• Infringe intellectual property or privacy rights.</li>
                        <li>• Upload malicious code or disrupt platform services.</li>
                        <li>• Collect or misuse platform data without authorization.</li>
                        <li>• Use the platform in violation of applicable law.</li>
                      </ul>
                    </div>

                    {/* Section 16 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">16. User Content and Intellectual Property</h4>
                      <p>
                        Users retain ownership of content they create, subject to the license granted below.
                      </p>
                      <p>
                        By submitting content, users grant PARVARISH permission to host, store, reproduce, display, and distribute that content as reasonably necessary to operate the platform and provide its features.
                      </p>
                      <p>
                        Users are responsible for ensuring they have the necessary rights and permissions to publish their content.
                      </p>
                      <p>
                        The PARVARISH name, branding, software, and original platform materials remain the property of their respective owners. Third-party content remains subject to its owner's rights.
                      </p>
                    </div>

                    {/* Section 17 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">17. Platform Management and Availability</h4>
                      <p>
                        Authorized administrators may manage official publications within their assigned permissions.
                      </p>
                      <p>
                        PARVARISH may modify, suspend, or discontinue features for maintenance, security, development, or legal compliance. Access may be restricted for misuse or violations of this agreement, subject to applicable law.
                      </p>
                      <p>
                        The platform is not guaranteed to be uninterrupted, error-free, or continuously available.
                      </p>
                    </div>

                    {/* Section 18 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">18. Disclaimer and Limitation of Liability</h4>
                      <p>
                        To the extent permitted by applicable law, PARVARISH is provided on an “as available” basis.
                      </p>
                      <p>
                        Nothing in this agreement excludes or limits rights or liabilities that cannot legally be excluded or limited.
                      </p>
                    </div>

                    {/* Section 19 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">19. Changes to This Agreement</h4>
                      <p>
                        This agreement may be updated as the platform develops or legal requirements change. Where required, users will be notified and asked to accept revised terms before continuing to use affected services.
                      </p>
                    </div>

                    {/* Section 20 */}
                    <div className="p-4 bg-white rounded-2xl border border-[#EAE6DF] space-y-1.5 shadow-2xs">
                      <h4 className="font-bold text-slate-900 text-xs font-serif">20. Governing Law</h4>
                      <p>
                        This agreement is subject to applicable laws and regulations. The platform operator should specify the appropriate governing law and dispute-resolution arrangements before publication.
                      </p>
                    </div>
                  </div>

                  {/* Important Notice Callout */}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/90 text-amber-900 space-y-1 font-serif text-[11px] leading-relaxed shadow-2xs">
                    <strong className="block text-amber-950 font-bold uppercase tracking-wider text-[10px]">
                      Important Notice
                    </strong>
                    <p>
                      This document is a general draft for PARVARISH. Before publication, verify that it accurately reflects the platform's actual data practices, security controls, third-party integrations, and applicable legal requirements.
                    </p>
                  </div>

                </div>
              )}
            </div>

            {/* Modal Footer */}
            {activeModal !== 'about' && (
              <div className="px-6 py-3.5 bg-slate-100/80 border-t border-slate-200 flex items-center justify-end">
                <button
                  onClick={() => setActiveModal(null)}
                  className="bg-[#091734] hover:bg-[#15274d] text-[#FFF4DC] px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
