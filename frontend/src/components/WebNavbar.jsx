import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Home, 
  Compass, 
  Trophy, 
  Calendar, 
  Bell, 
  User, 
  LogOut, 
  PlusCircle, 
  LayoutDashboard, 
  FileText, 
  ShieldAlert, 
  Sparkles
} from 'lucide-react';

export function WebNavbar({ activeTab, setActiveTab, unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const studentFacultyLinks = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'magazine', label: 'Magazine', icon: BookOpen },
    { id: 'achievements', label: 'Spotlight', icon: Trophy },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
  ];

  const adminLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'posts', label: 'All Posts', icon: FileText },
    { id: 'create', label: 'Publish Article', icon: PlusCircle, highlight: true },
    { id: 'moderation', label: 'Moderation', icon: ShieldAlert },
    { id: 'home', label: 'Magazine Feed', icon: Home },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadCount },
  ];

  const links = isAdmin ? adminLinks : studentFacultyLinks;

  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Head of Department', color: 'bg-amber-100 text-amber-900 border-amber-300' };
    if (user?.role === 'FACULTY') return { label: 'Faculty', color: 'bg-blue-100 text-blue-900 border-blue-300' };
    return { label: 'Student', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  };

  const roleBadge = getRoleBadge();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#070D19]/95 backdrop-blur-md border-b border-amber-900/10 dark:border-[#1F304E] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Branding & University Badge */}
          <div 
            onClick={() => setActiveTab(isAdmin ? 'dashboard' : 'home')}
            className="flex items-center space-x-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] dark:bg-amber-400 flex items-center justify-center text-white dark:text-[#0B1B3A] shadow-sm border border-amber-200 group-hover:scale-105 transition-transform">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-xl text-[#1E3A8A] dark:text-[#F8FAFC] tracking-tight">
                  PARVARISH
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                  Official Web
                </span>
              </div>
              <p className="text-[11px] text-amber-800/80 dark:text-[#C5A880] font-serif italic -mt-0.5 hidden sm:block">
                The Official University Social Magazine
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;

              if (link.highlight) {
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#1E3A8A] dark:bg-amber-400 hover:bg-blue-950 dark:hover:bg-amber-300 text-white dark:text-[#0B1B3A] font-medium text-xs shadow-sm transition-all border border-amber-200 active:scale-95 mx-1"
                  >
                    <PlusCircle size={15} />
                    <span>{link.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all relative ${
                    isActive 
                      ? 'bg-[#F5EEDC] text-[#0B1B3A] font-bold shadow-xs border border-[#EAE6DF]' 
                      : 'text-slate-600 dark:text-[#F5F0E3] hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="relative">
                    <Icon size={16} className={isActive ? 'text-[#0B1B3A]' : 'text-slate-500 dark:text-[#D6D9E2]'} />
                    {Boolean(link.badge) && link.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[9px] font-bold px-1 rounded-full border border-white">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: User Profile & Actions */}
          <div className="flex items-center space-x-3">
            
            {/* User Profile Button */}
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-2 p-1.5 rounded-2xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="w-8 h-8 rounded-full border-2 border-amber-300 overflow-hidden shadow-2xs">
                <img
                  src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden lg:block text-left text-xs">
                <span className="font-bold text-slate-800 block truncate max-w-[120px]">
                  {user?.name}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
            >
              <LogOut size={17} />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
