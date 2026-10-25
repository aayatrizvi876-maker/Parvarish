import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Check, EyeOff, Trash2, UserX, AlertCircle, ArrowLeft } from 'lucide-react';

export function AdminModerationView({ onBack }) {
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await api.getAdminModeration(statusFilter);
      setReports(res.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleAction = async (reportId, action) => {
    try {
      await api.moderateReport(reportId, action);
      fetchReports();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 bg-slate-100 min-h-screen p-4 pb-16 animate-fade-in space-y-4">
      <div className="flex items-center space-x-2">
        {onBack && (
          <button onClick={onBack} className="p-1.5 -ml-1 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer" title="Back">
            <ArrowLeft size={18} />
          </button>
        )}
        <ShieldAlert size={22} className="text-amber-600" />
        <h2 className="font-serif-title text-xl font-bold text-slate-900">Comment Moderation Queue</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white rounded-xl p-1 border border-slate-200 text-xs font-semibold">
        {['PENDING', 'RESOLVED', 'DISMISSED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              statusFilter === s ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Checking reported comments desk...</div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
            No reported comments matching status {statusFilter}.
          </div>
        ) : (
          reports.map((rep) => (
            <div key={rep.reportId} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Reason: {rep.reason}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(rep.reportedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-900">{rep.comment.author.name}</span>
                  <span className="text-[10px] text-slate-400">({rep.comment.author.email})</span>
                </div>
                <p className="text-slate-800 italic">"{rep.comment.content}"</p>
              </div>

              <p className="text-[10px] text-slate-500">
                Reported by <strong>{rep.reporterName}</strong>
              </p>

              {statusFilter === 'PENDING' && (
                <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleAction(rep.reportId, 'DISMISS')}
                    className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold text-[10px] flex flex-col items-center"
                  >
                    <Check size={14} />
                    <span>Dismiss</span>
                  </button>

                  <button
                    onClick={() => handleAction(rep.reportId, 'HIDE')}
                    className="p-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 font-semibold text-[10px] flex flex-col items-center border border-amber-200"
                  >
                    <EyeOff size={14} />
                    <span>Hide</span>
                  </button>

                  <button
                    onClick={() => handleAction(rep.reportId, 'DELETE')}
                    className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[10px] flex flex-col items-center border border-rose-200"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => handleAction(rep.reportId, 'RESTRICT_USER')}
                    className="p-2 rounded-xl bg-rose-900 text-white hover:bg-rose-950 font-semibold text-[10px] flex flex-col items-center shadow"
                  >
                    <UserX size={14} />
                    <span>Suspend</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
