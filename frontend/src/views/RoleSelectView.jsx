import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  UserCheck, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  BookOpen, 
  Lock, 
  LogOut,
  Sparkles
} from 'lucide-react';

export function RoleSelectView() {
  const { user, selectRole, isLoading, authError, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState('STUDENT');

  const roles = [
    {
      id: 'STUDENT',
      icon: GraduationCap,
      emoji: '🎓',
      title: 'Student',
      tagline: 'Campus Life & Magazine',
      description: 'Explore student feed, read the Digital Magazine, like, bookmark articles, and engage in campus discussions.',
      badge: 'Direct Access',
      badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      activeBorder: 'border-[#1E3A8A] dark:border-blue-500 bg-blue-50/70 dark:bg-[#132238]',
      ringColor: 'ring-2 ring-[#1E3A8A]/30 dark:ring-blue-500/40'
    },
    {
      id: 'FACULTY',
      icon: UserCheck,
      emoji: '👨‍🏫',
      title: 'Faculty',
      tagline: 'Academic & Research Showcase',
      description: 'Stay connected with departmental updates, publish academic articles, research showcases, and mentor students.',
      badge: 'Academic Staff',
      badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      activeBorder: 'border-[#1E3A8A] dark:border-blue-500 bg-blue-50/70 dark:bg-[#132238]',
      ringColor: 'ring-2 ring-[#1E3A8A]/30 dark:ring-blue-500/40'
    },
    {
      id: 'ADMIN',
      icon: ShieldCheck,
      emoji: '🏛️',
      title: 'HOD / Admin',
      tagline: 'Department Administration & Studio',
      description: 'Departmental publishing studio, official university announcements, moderation control, event manager & analytics.',
      badge: 'Passcode Required',
      hasLock: true,
      badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold',
      activeBorder: 'border-amber-600 dark:border-amber-500 bg-amber-50/70 dark:bg-[#2A2010]',
      ringColor: 'ring-2 ring-amber-500/40 dark:ring-amber-500/50'
    }
  ];

  const handleContinue = async () => {
    try {
      await selectRole(selectedRole);
    } catch (err) {
      console.error('Role selection error:', err);
    }
  };

  const currentRoleObj = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 py-10 px-4 flex flex-col justify-between font-sans transition-colors duration-200">
      <div className="max-w-xl mx-auto w-full pt-2 sm:pt-6">
        
        {/* Header / University Branding */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#091734] dark:bg-[#112240] text-amber-300 mx-auto shadow-md border-2 border-amber-400/40 mb-1">
            <BookOpen size={28} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xs uppercase tracking-widest text-amber-800 dark:text-amber-400 font-bold">
              United University
            </h1>
            <h2 className="text-3xl font-extrabold font-serif text-[#091734] dark:text-white tracking-tight">
              PARVARISH
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-serif italic">
              The Official University Social Magazine
            </p>
          </div>

          <div className="pt-2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              Select Your Role
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please choose how you would like to participate today
            </p>
          </div>

          {/* Active User Chip */}
          {user && (
            <div className="inline-flex items-center space-x-2 bg-white dark:bg-[#0D1B2A] border border-amber-200/80 dark:border-amber-900/40 px-3 py-1.5 rounded-full shadow-2xs mt-1">
              {user.profileImage ? (
                <img 
                  src={user.profileImage} 
                  alt={user.name || 'User'} 
                  className="w-5 h-5 rounded-full object-cover border border-amber-300"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center justify-center">
                  {(user.name || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Signed in as <strong className="text-slate-900 dark:text-white">{user.name || user.email?.split('@')[0]}</strong>
              </span>
              <span className="text-[10px] text-slate-400">({user.email})</span>
            </div>
          )}
        </div>

        {/* Global Error Banner */}
        {authError && (
          <div className="mb-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs p-3.5 rounded-2xl text-center font-medium shadow-xs">
            {authError}
          </div>
        )}

        {/* Role Cards List */}
        <div className="space-y-3.5">
          {roles.map((r) => {
            const isSelected = selectedRole === r.id;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRole(r.id)}
                className={`w-full p-4 sm:p-5 rounded-2xl border-2 text-left transition-all relative flex items-start space-x-4 cursor-pointer outline-none ${
                  isSelected 
                    ? `${r.activeBorder} ${r.ringColor} shadow-md` 
                    : 'border-slate-200/80 dark:border-[#1E2D48] bg-white dark:bg-[#0F1B2E] hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
                }`}
              >
                {/* Role Emoji / Icon Avatar */}
                <div className={`p-3 rounded-2xl text-2xl shrink-0 transition-colors shadow-2xs ${
                  isSelected 
                    ? r.id === 'ADMIN' ? 'bg-amber-600 text-white' : 'bg-[#091734] dark:bg-blue-600 text-white' 
                    : 'bg-amber-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                }`}>
                  <span>{r.emoji}</span>
                </div>

                {/* Content */}
                <div className="flex-1 pr-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                      {r.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center space-x-1 ${r.badgeClass}`}>
                      {r.hasLock && <Lock size={10} className="mr-0.5" />}
                      <span>{r.badge}</span>
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-amber-800 dark:text-amber-400 mt-0.5">
                    {r.tagline}
                  </p>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    {r.description}
                  </p>
                </div>

                {/* Radio selection checkmark */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all absolute top-4 right-4 ${
                  isSelected 
                    ? r.id === 'ADMIN'
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-[#091734] dark:bg-blue-600 border-[#091734] dark:border-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-600 bg-transparent'
                }`}>
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Primary CTA */}
      <div className="max-w-md mx-auto w-full pt-8 pb-4 space-y-3">
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className={`w-full py-4 px-5 rounded-2xl flex items-center justify-center space-x-2 text-white font-bold text-sm shadow-lg transition-all active:scale-[0.98] border cursor-pointer ${
            selectedRole === 'ADMIN'
              ? 'bg-amber-700 hover:bg-amber-800 border-amber-500 shadow-amber-900/20'
              : 'bg-[#091734] hover:bg-blue-950 dark:bg-blue-600 dark:hover:bg-blue-700 border-blue-900/40 shadow-blue-950/30'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {selectedRole === 'ADMIN' ? (
                <>
                  <Lock size={16} className="text-amber-200" />
                  <span>Enter Passcode & Continue as HOD / Admin</span>
                </>
              ) : (
                <>
                  <span>Continue as {currentRoleObj?.title}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </>
          )}
        </button>

        <div className="flex items-center justify-center pt-1">
          <button
            onClick={logout}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium py-1 transition-colors cursor-pointer"
          >
            <LogOut size={13} />
            <span>Cancel & Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}