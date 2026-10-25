import React from 'react';
import { BookOpen, Heart, ShieldCheck } from 'lucide-react';

export function WebFooter() {
  return (
    <footer className="w-full bg-white border-t border-amber-900/10 py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-serif">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-lg bg-[#1E3A8A] flex items-center justify-center text-white">
            <BookOpen size={13} />
          </div>
          <span className="font-bold text-[#1E3A8A] tracking-tight">PARVARISH</span>
          <span className="text-slate-300">|</span>
          <span className="italic text-slate-600">The Official University Social Magazine</span>
        </div>

        <div className="flex items-center space-x-6 text-[11px] text-slate-500">
          <span className="flex items-center space-x-1">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Official University Publishing Authority</span>
          </span>
          <span>© 2026 Parvarish · All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
}
