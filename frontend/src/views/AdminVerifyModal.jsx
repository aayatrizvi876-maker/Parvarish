import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BackIcon, EyeIcon } from '../components/icons/ParvarishIcons';
import { ShieldCheck, EyeOff, KeyRound, AlertCircle, Lock, ArrowLeft } from 'lucide-react';

export function AdminVerifyModal() {
  const { verifyAdmin, cancelAdminVerify, logout, isLoading, authError } = useAuth();
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    try {
      await verifyAdmin(code.trim());
    } catch (err) {
      console.error('Admin verification failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#091734]/80 dark:bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] dark:bg-[#0D1A2D] border border-amber-900/20 dark:border-amber-400/20 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-fade-in text-slate-900 dark:text-slate-100 font-sans">
        
        {/* Top Header Controls */}
        <div className="flex items-center justify-between mb-5">
          <button
            type="button"
            onClick={cancelAdminVerify}
            className="flex items-center space-x-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-[#091734] dark:hover:text-white p-1.5 -ml-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Role Selection</span>
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-300 dark:border-amber-700/60 shadow-xs">
            <ShieldCheck size={26} />
          </div>

          <div className="w-14"></div>
        </div>

        {/* Title and Instruction */}
        <div className="text-center mb-6 space-y-1">
          <div className="inline-flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800 mb-1">
            <Lock size={12} />
            <span>Restricted Access</span>
          </div>
          <h3 className="text-2xl font-bold font-serif text-[#091734] dark:text-white">
            HOD / Admin Verification
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Administrative access requires departmental passcode verification to protect university publishing.
          </p>
        </div>

        {/* Error Notification */}
        {authError && (
          <div className="mb-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs p-3.5 rounded-2xl flex items-start space-x-2.5 animate-shake">
            <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Verification Error</span>
              <span>{authError}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                <span>Departmental Passcode</span>
                <span className="text-rose-500">*</span>
              </label>
            </div>

            <div className="relative">
              <input
                type={showCode ? 'text' : 'password'}
                placeholder="Enter HOD / Admin passcode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoFocus
                className="w-full bg-white dark:bg-[#070E1A] border border-slate-300 dark:border-[#1F304E] text-sm text-slate-900 dark:text-white rounded-2xl px-4 py-3.5 pl-11 pr-11 outline-none focus:border-amber-600 dark:focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-mono tracking-wider transition-all"
              />
              <KeyRound size={18} className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5 cursor-pointer"
                title={showCode ? 'Hide passcode' : 'Show passcode'}
              >
                {showCode ? <EyeOff size={18} /> : <EyeIcon size={18} />}
              </button>
            </div>

            <div className="mt-2 px-1 flex items-center justify-between">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Departmental passcodes are issued strictly to authorized HOD personnel.
              </p>
              <button
                type="button"
                onClick={() => setCode('HOD2026')}
                className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-lg border border-amber-300 dark:border-amber-700 font-bold shrink-0 ml-2 hover:bg-amber-200 transition-colors cursor-pointer"
              >
                Insert: HOD2026
              </button>
            </div>
          </div>

          <div className="pt-3 space-y-2.5">
            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-2 border border-amber-600 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  <span>Verify Passcode & Enter as HOD</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={cancelAdminVerify}
              className="w-full bg-white dark:bg-[#0B1526] hover:bg-slate-100 dark:hover:bg-[#13223B] text-slate-700 dark:text-slate-300 font-semibold py-3 px-4 rounded-2xl text-xs border border-slate-200 dark:border-[#1F304E] transition-colors cursor-pointer"
            >
              Back to Role Selection (Choose Student or Faculty)
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={logout}
                className="text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                Cancel & Sign Out
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}