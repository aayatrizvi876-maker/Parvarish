import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  PlusCircle, FileText, ShieldAlert, Users, TrendingUp, Heart, MessageSquare, 
  CheckCircle2, BarChart2, Calendar, Award, RefreshCw, ChevronRight, Shield
} from 'lucide-react';

export function AdminDashboardView({ onNavigate }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminAnalytics();
      setMetrics(res.metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="flex-1 bg-slate-100 min-h-screen p-4 pb-16 animate-fade-in space-y-4">
      
      {/* HOD Header Greeting */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-2xl -mr-8 -mt-8"></div>
        
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Logged in as HOD
            </span>
            <button onClick={fetchMetrics} className="text-slate-400 hover:text-white p-1">
              <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
          <span className="text-xs text-slate-400">{new Date().toLocaleDateString()}</span>
        </div>

        <div className="flex items-center space-x-3 relative z-10">
          <img
            src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow"
          />
          <div>
            <div className="flex items-center space-x-1">
              <h2 className="font-serif-title font-bold text-lg text-slate-100">{user?.name}</h2>
              <CheckCircle2 size={16} className="text-emerald-400 fill-emerald-900 shrink-0" />
            </div>
            <p className="text-xs text-emerald-400 font-medium">Head of Department · Official Parvarish Account</p>
          </div>
        </div>
      </div>

      {/* Quick Action Matrix */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => onNavigate('create')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-2xl flex flex-col items-center justify-center text-center shadow-md active:scale-95 transition-all"
          >
            <PlusCircle size={22} className="mb-1" />
            <span className="text-xs font-bold">Create Post</span>
          </button>

          <button
            onClick={() => onNavigate('posts')}
            className="bg-white hover:bg-slate-50 text-slate-800 p-3.5 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm active:scale-95 transition-all"
          >
            <FileText size={22} className="text-slate-700 mb-1" />
            <span className="text-xs font-bold">Manage Posts</span>
          </button>

          <button
            onClick={() => onNavigate('moderation')}
            className="bg-white hover:bg-slate-50 text-slate-800 p-3.5 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm active:scale-95 transition-all relative"
          >
            <ShieldAlert size={22} className="text-amber-600 mb-1" />
            <span className="text-xs font-bold">Moderation</span>
          </button>
        </div>
      </div>

      {/* Real Platform KPI Overview */}
      <div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 px-1">
          Platform Overview (Real Database Query)
        </h3>

        {isLoading || !metrics ? (
          <div className="p-6 text-center text-xs text-slate-500">Updating live platform counters...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">Total Users</span>
                <Users size={16} className="text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900 block">{metrics.totalUsers}</span>
              <p className="text-[10px] text-slate-400">
                {metrics.studentsCount} Students · {metrics.facultyCount} Faculty
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">HOD Followers</span>
                <Users size={16} className="text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900 block">{metrics.totalFollowers}</span>
              <p className="text-[10px] text-emerald-600 font-medium">Real social followers count</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">Published Posts</span>
                <FileText size={16} className="text-teal-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900 block">{metrics.totalPosts}</span>
              <p className="text-[10px] text-slate-400">Official HOD publications</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-semibold">Engagement</span>
                <Heart size={16} className="text-rose-600" />
              </div>
              <span className="text-2xl font-bold text-slate-900 block">{metrics.totalLikes}</span>
              <p className="text-[10px] text-slate-400">{metrics.totalComments} Comments total</p>
            </div>
          </div>
        )}
      </div>

      {/* Admin Sub-Module Links */}
      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm text-xs font-semibold">
        <button
          onClick={() => onNavigate('users')}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-2.5 text-slate-800">
            <Users size={18} className="text-emerald-700" />
            <span>User Management & Roles</span>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>

        <button
          onClick={() => onNavigate('analytics')}
          className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-2.5 text-slate-800">
            <BarChart2 size={18} className="text-teal-700" />
            <span>Detailed Analytics & Audit Logs</span>
          </div>
          <ChevronRight size={16} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
}
