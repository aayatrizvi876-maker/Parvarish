import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Wifi, Battery, Signal, ArrowDownToLine } from 'lucide-react';

export function MobileFrameWrapper({ children, activeTab, isOffline = false }) {
  const [time, setTime] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTime(`${hours % 12 || 12}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900 flex flex-col items-center justify-start p-0 sm:py-6 sm:px-4">
      {/* Device Viewport Top Header Info for Desktop Viewers */}
      <div className="hidden sm:flex items-center justify-between w-full max-w-[430px] mb-3 px-4 py-2 bg-slate-900/90 backdrop-blur-md text-slate-400 rounded-2xl text-xs border border-slate-800 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-200">Parvarish Mobile App</span>
        </div>
        <a
          href="/parvarish-mobile.apk"
          download="parvarish-mobile.apk"
          className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all active:scale-95 text-[11px] font-medium"
        >
          <ArrowDownToLine size={13} />
          <span>Get APK</span>
        </a>
      </div>

      {/* Realistic Native Smartphone Frame Container */}
      <div className="w-full mobile-frame-container shadow-2xl relative flex flex-col bg-[#FAF8F5]">
        
        {/* Native Mobile Status Bar (Notch + Time + Cellular + Wifi + Battery) */}
        <div className="bg-slate-900 text-white px-7 pt-3.5 pb-2.5 flex items-center justify-between text-xs select-none z-40 shrink-0">
          <span className="font-semibold text-[13px] tracking-tight">{time}</span>
          
          {/* Dynamic Island / Camera Notch */}
          <div className="w-24 h-4 bg-black rounded-full mx-auto hidden sm:flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80 mr-4"></div>
            <div className="w-2 h-2 rounded-full bg-blue-900/40"></div>
          </div>
          
          <div className="flex items-center space-x-2 text-slate-300">
            <Signal size={13} className="text-slate-200" />
            <span className="text-[10px] font-bold tracking-wider text-slate-300">5G</span>
            <Wifi size={13} className="text-slate-200" />
            <Battery size={15} className="text-emerald-400" />
          </div>
        </div>

        {/* Offline Banner Indicator */}
        {isOffline && (
          <div className="bg-amber-600 text-white text-xs px-4 py-1.5 text-center font-medium flex items-center justify-center space-x-2 shrink-0">
            <span>You're currently viewing cached offline data.</span>
          </div>
        )}

        {/* Scrollable Content View Area */}
        <div className="flex-1 flex flex-col overflow-y-auto relative bg-[#FAF8F5]">
          {children}
        </div>

        {/* Native Mobile Bottom Home Gesture Bar */}
        <div className="bg-[#FAF8F5] pt-1.5 pb-2 text-center select-none shrink-0 border-t border-slate-200/50">
          <div className="w-32 h-1 bg-slate-400/40 rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
