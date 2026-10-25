import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart2, TrendingUp, Users, Heart, Shield, Activity, ArrowLeft } from 'lucide-react';

export function AdminAnalyticsView({ onBack }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setIsLoading(true);
        const res = await api.getAdminAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (isLoading || !data) {
    return <div className="p-8 text-center text-xs text-slate-500">Generating analytics metrics...</div>;
  }

  const { metrics, categoryStats, popularPosts, auditLogs } = data;

  return (
    <div className="flex-1 bg-slate-100 min-h-screen p-4 pb-16 animate-fade-in space-y-4">
      <div className="flex items-center space-x-2">
        {onBack && (
          <button onClick={onBack} className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer" title="Back">
            <ArrowLeft size={18} />
          </button>
        )}
        <BarChart2 size={22} className="text-teal-700" />
        <h2 className="font-serif-title text-xl font-bold text-slate-900">Platform Analytics</h2>
      </div>

      {/* Engagement Overview Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Engagement Rate Metric</h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-slate-900">{metrics.engagementRate}</span>
            <span className="text-xs text-slate-500 block">Avg interactions per published post</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
        </div>
      </div>

      {/* Category Popularity Stats */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Category Breakdown</h3>
        <div className="space-y-2">
          {categoryStats.map((c, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-slate-800">
                <span className="capitalize">{c.category}</span>
                <span>{c.postCount} posts</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, (c.postCount / (metrics.totalPosts || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Posts */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Most Popular Publications</h3>
        <div className="space-y-2">
          {popularPosts.map((p) => (
            <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-900 line-clamp-1">{p.title}</span>
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="uppercase text-emerald-700">{p.category_id}</span>
                <span>❤️ {p.likes} · 💬 {p.comments}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Audit Trail */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">System Audit Trail</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-2 bg-slate-50 rounded-lg text-[11px] flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800">{log.action}</span>
                <span className="text-slate-500 block">By {log.admin_name}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
