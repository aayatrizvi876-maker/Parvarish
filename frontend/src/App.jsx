import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarNav } from './components/SidebarNav';
import { BottomNav } from './components/BottomNav';
import { LoginView } from './views/LoginView';
import { RoleSelectView } from './views/RoleSelectView';
import { ProfileSetupView } from './views/ProfileSetupView';
import { AdminVerifyModal } from './views/AdminVerifyModal';
import { HomeView } from './views/HomeView';
import { PostDetailModal } from './views/PostDetailModal';
import { HODProfileView } from './views/HODProfileView';
import { ExploreView } from './views/ExploreView';
import { VideosView } from './views/VideosView';
import { MagazineView } from './views/MagazineView';
import { EventsView } from './views/EventsView';
import { AchievementsView } from './views/AchievementsView';
import { NotificationsView } from './views/NotificationsView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminCreatePostView } from './views/AdminCreatePostView';
import { AdminPostManageView } from './views/AdminPostManageView';
import { AdminModerationView } from './views/AdminModerationView';
import { AdminUserManageView } from './views/AdminUserManageView';
import { AdminAnalyticsView } from './views/AdminAnalyticsView';
import { api } from './services/api';

function MainAppContent() {
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    pendingAdminVerify, 
    isSelectingRole, 
    setIsSelectingRole,
    isSettingUpProfile, 
    setIsSettingUpProfile, 
    logout, 
    selectRole 
  } = useAuth();

  // Navigation & View States
  const [activeTab, setActiveTab] = useState('home');
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [modalType, setModalType] = useState(null); // 'create_event', 'create_achievement'

  // Sync Unread Notifications Count
  useEffect(() => {
    if (isAuthenticated && user) {
      api.getNotifications()
        .then(res => setUnreadNotifications(res.unreadCount || 0))
        .catch(() => {});
    }
  }, [isAuthenticated, user, activeTab]);

  // Adjust default tab based on user role when logging in
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('home');
      }
    }
  }, [user?.role]);

  // Render View based on activeTab
  const renderCurrentView = () => {
    if (viewingProfileId) {
      return (
        <ProfileView
          profileUserId={viewingProfileId}
          onOpenPost={(id) => setSelectedPostId(id)}
          onClose={() => setViewingProfileId(null)}
          onBack={() => setViewingProfileId(null)}
          onOpenNotifications={() => setActiveTab('notifications')}
        />
      );
    }

    switch (activeTab) {
      // Common Views
      case 'home':
        return (
          <HomeView
            onOpenPost={(id) => setSelectedPostId(id)}
            onOpenProfile={(profileId) => setViewingProfileId(profileId)}
            onOpenNotifications={() => setActiveTab('notifications')}
            unreadCount={unreadNotifications}
          />
        );
      case 'explore':
        return <ExploreView onOpenPost={(id) => setSelectedPostId(id)} />;
      case 'video':
        return <VideosView onOpenPost={(id) => setSelectedPostId(id)} />;
      case 'magazine':
        return <MagazineView onOpenPost={(id) => setSelectedPostId(id)} />;
      case 'achievements':
        return <AchievementsView onCreateAchievementClick={() => setModalType('create_achievement')} />;
      case 'events':
        return <EventsView onCreateEventClick={() => setModalType('create_event')} />;
      case 'notifications':
        return <NotificationsView onOpenPost={(id) => setSelectedPostId(id)} />;
      case 'profile':
        return (
          <ProfileView 
            onSwitchRole={() => setIsSelectingRole(true)} 
            onOpenPost={(id) => setSelectedPostId(id)} 
            onBack={() => setActiveTab('home')}
            onOpenNotifications={() => setActiveTab('notifications')}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            onSwitchRole={() => setIsSelectingRole(true)} 
            onBack={() => setActiveTab('home')}
            onOpenNotifications={() => setActiveTab('notifications')}
          />
        );

      // Admin Specific Views
      case 'dashboard':
        return <AdminDashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'create':
        return (
          <AdminCreatePostView
            onPostPublished={() => setActiveTab('home')}
            onCancel={() => setActiveTab('dashboard')}
          />
        );
      case 'posts':
        return <AdminPostManageView onOpenPost={(id) => setSelectedPostId(id)} />;
      case 'moderation':
        return <AdminModerationView />;
      case 'users':
        return <AdminUserManageView />;
      case 'analytics':
        return <AdminAnalyticsView />;

      default:
        return (
          <HomeView
            onOpenPost={(id) => setSelectedPostId(id)}
            onOpenProfile={(profileId) => setViewingProfileId(profileId)}
            onOpenNotifications={() => setActiveTab('notifications')}
            unreadCount={unreadNotifications}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-12 h-12 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-serif font-bold text-2xl text-[#1E3A8A]">PARVARISH</p>
        <p className="text-sm text-amber-800 italic font-serif">Where Every Story Grows...</p>
      </div>
    );
  }

  // 1. Unauthenticated -> Show Google Login Screen
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // 2. Select Your Role Screen
  if (isSelectingRole) {
    return <RoleSelectView />;
  }

  // 3. Pending Admin Verification Modal Overlay (HOD Password Prompt)
  if (pendingAdminVerify) {
    return <AdminVerifyModal />;
  }

  // 4. Edit Profile Details Screen (Name, Dept, Bio, Avatar)
  if (isSettingUpProfile) {
    return (
      <ProfileSetupView onComplete={() => {
        setIsSettingUpProfile(false);
      }} />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 flex font-sans">
      {/* Left Sidebar Navigation (exact design as in uploaded image) */}
      <div className="hidden md:block">
        <SidebarNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setViewingProfileId(null);
            setActiveTab(tab);
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#FAF8F5] pb-20 md:pb-0">
        {renderCurrentView()}

        {/* Post Detail Modal */}
        {selectedPostId && (
          <PostDetailModal
            postId={selectedPostId}
            onClose={() => setSelectedPostId(null)}
            onOpenProfile={(profileId) => {
              setSelectedPostId(null);
              setViewingProfileId(profileId);
            }}
          />
        )}

        {/* Create Event Modal for Admin */}
        {modalType === 'create_event' && (
          <CreateEventModal onClose={() => setModalType(null)} />
        )}

        {/* Create Achievement Modal for Admin */}
        {modalType === 'create_achievement' && (
          <CreateAchievementModal onClose={() => setModalType(null)} />
        )}

        {/* Mobile-only Bottom Navigation for touch devices under md */}
        <div className="md:hidden">
          <BottomNav
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setViewingProfileId(null);
              setActiveTab(tab);
            }}
            unreadCount={unreadNotifications}
          />
        </div>
      </div>
    </div>
  );
}

// Inline Admin Quick Creation Modals for Events & Achievements
function CreateEventModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('10:00 AM');
  const [venue, setVenue] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createEvent({
        title, description, eventDate, eventTime, venue,
        organizer: 'Department of CSE',
        status: 'UPCOMING'
      });
      onClose();
      alert('Event created successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
        <h3 className="font-serif-title font-bold text-base text-slate-900">Create Department Event</h3>
        <input type="text" placeholder="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-slate-50 border p-2.5 text-xs rounded-xl outline-none" />
        <textarea placeholder="Event Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full bg-slate-50 border p-2.5 text-xs rounded-xl outline-none" rows={3} />
        <div className="grid grid-cols-2 gap-2">
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required className="bg-slate-50 border p-2 text-xs rounded-xl" />
          <input type="text" placeholder="10:00 AM" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="bg-slate-50 border p-2 text-xs rounded-xl" />
        </div>
        <input type="text" placeholder="Venue Location" value={venue} onChange={(e) => setVenue(e.target.value)} required className="w-full bg-slate-50 border p-2.5 text-xs rounded-xl outline-none" />
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs bg-slate-100 rounded-xl">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-xs bg-emerald-600 text-white font-bold rounded-xl">Publish Event</button>
        </div>
      </form>
    </div>
  );
}

function CreateAchievementModal({ onClose }) {
  const [personName, setPersonName] = useState('');
  const [role, setRole] = useState('Student');
  const [title, setTitle] = useState('');
  const [award, setAward] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createAchievement({ personName, role, title, award, description });
      onClose();
      alert('Achievement added to Wall of Achievements.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 z-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-2xl">
        <h3 className="font-serif-title font-bold text-base text-slate-900">Add to Wall of Achievements</h3>
        <input type="text" placeholder="Recipient Name(s)" value={personName} onChange={(e) => setPersonName(e.target.value)} required className="w-full bg-slate-50 border p-2.5 text-xs rounded-xl outline-none" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-50 border p-2 text-xs rounded-xl">
          <option value="Student">Student</option>
          <option value="Faculty Member">Faculty Member</option>
          <option value="Alumni">Alumni</option>
        </select>
        <input type="text" placeholder="Achievement Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full bg-slate-50 border p-2.5 text-xs rounded-xl outline-none" />
        <input type="text" placeholder="Award / Rank / Prize" value={award} onChange={(e) => setAward(e.target.value)} required className="w-full bg-slate-50 border p-2.5 text-xs rounded-xl outline-none" />
        <textarea placeholder="Brief Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full bg-slate-50 border p-2.5 text-xs rounded-xl outline-none" rows={3} />
        <div className="flex justify-end space-x-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs bg-slate-100 rounded-xl">Cancel</button>
          <button type="submit" className="px-4 py-1.5 text-xs bg-amber-600 text-white font-bold rounded-xl">Add Achievement</button>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
