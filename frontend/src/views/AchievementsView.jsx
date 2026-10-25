import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Award, Plus, Sparkles, User, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AchievementsView({ onCreateAchievementClick }) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAchievements();
      setAchievements(res.achievements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="flex-1 bg-slate-100 min-h-screen p-4 pb-16 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Award size={24} className="text-amber-600" />
          <div>
            <h2 className="font-serif-title text-xl font-bold text-slate-900">Wall of Achievements</h2>
            <p className="text-[10px] text-slate-500">Celebrating student and faculty excellence.</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onCreateAchievementClick}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center space-x-1 shadow"
          >
            <Plus size={14} />
            <span>Add Achievement</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading Wall of Achievements...</div>
        ) : achievements.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
            No achievements published on the Wall yet.
          </div>
        ) : (
          achievements.map((ach) => (
            <div key={ach.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all p-4 space-y-3">
              <div className="flex items-start space-x-3">
                {ach.imageUrl ? (
                  <img src={ach.imageUrl} alt={ach.personName} className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-300 shadow-sm shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl shrink-0">
                    <Sparkles size={24} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 inline-block mb-1">
                    {ach.award}
                  </span>
                  <h3 className="font-serif-title font-bold text-base text-slate-900 leading-snug">
                    {ach.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 mt-1">
                    <User size={13} className="text-slate-400" />
                    <span>{ach.personName}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {ach.role}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                {ach.description}
              </p>

              <div className="text-[10px] font-medium text-slate-400 flex items-center justify-end space-x-1">
                <Calendar size={12} />
                <span>Honored on {ach.achievementDate}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
