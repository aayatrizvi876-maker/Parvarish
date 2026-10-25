import React from 'react';
import { 
  HomeIcon, 
  ExploreIcon, 
  MagazineIcon, 
  ProfileIcon, 
  AddIcon, 
  MyPostsIcon 
} from './icons/ParvarishIcons';
import { Trophy, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export function BottomNav({ activeTab, setActiveTab, unreadCount = 0 }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const role = user?.role || 'STUDENT';
  const isAdmin = role === 'ADMIN';

  const studentFacultyNavItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'explore', label: 'Explore', icon: ExploreIcon },
    { id: 'magazine', label: 'Magazine', icon: MagazineIcon },
    { id: 'achievements', label: 'Spotlight', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: ProfileIcon }
  ];

  const hodNavItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'explore', label: 'Explore', icon: ExploreIcon },
    { id: 'create', label: 'Create', icon: AddIcon, highlight: true },
    { id: 'magazine', label: 'Magazine', icon: MagazineIcon },
    { id: 'profile', label: 'Profile', icon: ProfileIcon }
  ];

  const navItems = isAdmin ? hodNavItems : studentFacultyNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#070D19]/95 backdrop-blur-md border-t border-amber-900/10 dark:border-[#1F304E] py-2 px-3 flex items-center justify-around z-50 shadow-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        if (item.highlight) {
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center -mt-6 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#0B1B3A] dark:bg-amber-400 hover:bg-blue-950 dark:hover:bg-amber-300 text-white dark:text-[#0B1B3A] flex items-center justify-center shadow-lg transition-transform group-active:scale-95 border-2 border-amber-200 dark:border-amber-400">
                <AddIcon size={24} />
              </div>
              <span className="text-[10px] font-semibold text-[#0B1B3A] dark:text-amber-300 mt-1">{item.label}</span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
              isActive 
                ? 'text-[#0B1B3A] dark:text-[#F5EEDC] font-bold' 
                : 'text-slate-500 dark:text-[#94A3B8] hover:text-[#0B1B3A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <div className="relative">
              <Icon 
                size={20} 
                selected={isActive}
                doorColor={isActive ? (isDark ? "#070D19" : "#ffffff") : (isDark ? "#070D19" : "#1E3A8A")}
                spineColor={isActive ? (isDark ? "#070D19" : "#ffffff") : (isDark ? "#070D19" : "#1E3A8A")}
                className={isActive ? 'text-[#0B1B3A] dark:text-[#F5EEDC] scale-105' : 'text-slate-500 dark:text-[#94A3B8]'} 
              />
              {Boolean(item.badge) && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-white">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight font-sans">{item.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-[#0B1B3A] dark:bg-[#F5EEDC] rounded-full mt-0.5"></span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
