import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Maximize2, MapPin, Calendar, Sparkles } from 'lucide-react';

export function MagazineImageViewer({
  photos = [],
  currentIndex = 0,
  onClose,
  onNavigate
}) {
  const currentPhoto = photos[currentIndex];

  // Keyboard navigation & escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
          onNavigate(currentIndex - 1);
        } else {
          onNavigate(photos.length - 1); // Loop to end
        }
      } else if (e.key === 'ArrowRight') {
        if (currentIndex < photos.length - 1) {
          onNavigate(currentIndex + 1);
        } else {
          onNavigate(0); // Loop to start
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos.length, onClose, onNavigate]);

  // Lock body scroll while lightbox is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!currentPhoto) return null;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    } else {
      onNavigate(photos.length - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < photos.length - 1) {
      onNavigate(currentIndex + 1);
    } else {
      onNavigate(0);
    }
  };

  const formatNumber = (num) => String(num).padStart(2, '0');

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#060D1E]/95 backdrop-blur-2xl flex flex-col justify-between select-none animate-fadeIn"
      onClick={onClose}
    >
      {/* Top Exhibition Bar */}
      <div 
        className="px-6 py-4 flex items-center justify-between text-white/90 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gallery / Exhibition Header */}
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse"></div>
          <span className="text-xs uppercase tracking-widest text-[#C5A880] font-serif font-bold">
            PARVARISH ARCHIVE • {currentPhoto.category || 'EXHIBITION'}
          </span>
        </div>

        {/* Center: Slide Index */}
        <div className="text-xs font-mono tracking-widest text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
          <span className="text-[#FFF4DC] font-bold">{formatNumber(currentIndex + 1)}</span>
          <span className="text-slate-500 mx-1.5">/</span>
          <span className="text-slate-400">{formatNumber(photos.length)}</span>
        </div>

        {/* Right: Close Button */}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 hover:text-white flex items-center justify-center transition-all border border-white/15"
          title="Close (Esc)"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Exhibition Stage */}
      <div 
        className="flex-1 relative flex items-center justify-center px-4 sm:px-16 py-2 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Navigation Button */}
        <button
          onClick={handlePrev}
          className="absolute left-3 sm:left-6 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#091734]/80 hover:bg-[#091734] border border-amber-300/30 text-amber-200 hover:text-white flex items-center justify-center shadow-2xl transition-all active:scale-90"
          title="Previous Photo (← Left Arrow)"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Next Navigation Button */}
        <button
          onClick={handleNext}
          className="absolute right-3 sm:right-6 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#091734]/80 hover:bg-[#091734] border border-amber-300/30 text-amber-200 hover:text-white flex items-center justify-center shadow-2xl transition-all active:scale-90"
          title="Next Photo (→ Right Arrow)"
        >
          <ChevronRight size={28} />
        </button>

        {/* The Exhibition Photograph */}
        <div className="relative max-h-[72vh] sm:max-h-[76vh] max-w-5xl w-full flex items-center justify-center">
          <img
            key={currentPhoto.id}
            src={currentPhoto.imageUrl}
            alt={currentPhoto.title || 'Exhibition Photo'}
            className="max-h-[72vh] sm:max-h-[76vh] max-w-full w-auto object-contain rounded-xl shadow-2xl border border-white/10 transition-opacity duration-300"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85';
            }}
          />
        </div>
      </div>

      {/* Bottom Exhibition Label / Caption Plate */}
      <div 
        className="px-6 py-5 bg-gradient-to-t from-[#040A17] via-[#040A17]/90 to-transparent z-20 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-2xl space-y-1.5">
          {currentPhoto.title && (
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#FFF4DC] tracking-wide">
              {currentPhoto.title}
            </h2>
          )}
          
          {currentPhoto.caption && (
            <p className="text-xs sm:text-sm text-slate-300 font-serif leading-relaxed italic">
              "{currentPhoto.caption}"
            </p>
          )}

          {/* Exhibition Archival Meta Tag */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-[#C5A880]/90 font-serif">
            {currentPhoto.location && (
              <span className="flex items-center space-x-1">
                <MapPin size={11} className="text-[#C5A880]" />
                <span>{currentPhoto.location}</span>
              </span>
            )}
            {currentPhoto.location && currentPhoto.year && <span>•</span>}
            {currentPhoto.year && (
              <span className="flex items-center space-x-1">
                <Calendar size={11} className="text-[#C5A880]" />
                <span>Archived {currentPhoto.year}</span>
              </span>
            )}
            {currentPhoto.curator && (
              <>
                <span>•</span>
                <span>Curated by {currentPhoto.curator}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
