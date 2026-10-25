import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, MapPin, Tag, Calendar, Sparkles, Check } from 'lucide-react';
import { magazineService } from '../../services/magazineService';

// Curated high-res university photo presets to assist the admin
const PRESET_PHOTOS = [
  {
    title: 'Historic Cloister Arches',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85',
    category: 'Architecture & Heritage',
    location: 'North Cloisters'
  },
  {
    title: 'Scholars Assembly at Convocation',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85',
    category: 'Convocation & Gala',
    location: 'Founder’s Hall'
  },
  {
    title: 'Autumn Campus Ginkgo Walk',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=85',
    category: 'Campus Life',
    location: 'South Promenade Gardens'
  },
  {
    title: 'Memorial Archives Reading Room',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=85',
    category: 'Architecture & Heritage',
    location: 'Memorial Library'
  },
  {
    title: 'University Chamber Symphony',
    url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1600&q=85',
    category: 'Fine Arts & Culture',
    location: 'Grand Auditorium'
  },
  {
    title: 'Laser Diffraction Research Lab',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=85',
    category: 'Research & Science',
    location: 'Physics Annex'
  }
];

export function AdminPhotoModal({
  isOpen,
  photoToEdit = null,
  onClose,
  onSaved
}) {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Architecture & Heritage');
  const [location, setLocation] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (photoToEdit) {
      setTitle(photoToEdit.title || '');
      setCaption(photoToEdit.caption || '');
      setImageUrl(photoToEdit.imageUrl || '');
      setCategory(photoToEdit.category || 'Architecture & Heritage');
      setLocation(photoToEdit.location || '');
      setYear(photoToEdit.year || new Date().getFullYear().toString());
    } else {
      setTitle('');
      setCaption('');
      setImageUrl('');
      setCategory('Architecture & Heritage');
      setLocation('');
      setYear(new Date().getFullYear().toString());
    }
    setError(null);
  }, [photoToEdit, isOpen]);

  if (!isOpen) return null;

  const categories = magazineService.getCategories().filter(c => c !== 'All');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      setError('Please provide a valid image URL or choose a preset photograph.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const photoData = {
        title: title.trim() || 'Untitled Archival Photograph',
        caption: caption.trim(),
        imageUrl: imageUrl.trim(),
        category,
        location: location.trim() || 'University Campus',
        year: year.trim() || new Date().getFullYear().toString(),
        curator: 'Department Archival Committee',
        publishedBy: 'ADMIN'
      };

      let result;
      if (photoToEdit?.id) {
        result = await magazineService.updatePhoto(photoToEdit.id, photoData);
      } else {
        result = await magazineService.addPhoto(photoData);
      }

      onSaved(result);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save photograph to the exhibition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setImageUrl(preset.url);
    if (!title) setTitle(preset.title);
    if (!location) setLocation(preset.location);
    if (preset.category) setCategory(preset.category);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-[#FAF8F5] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-amber-900/20 my-8 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#091734] px-6 py-4.5 text-white flex items-center justify-between border-b border-amber-300/20">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-serif font-bold">
              ADMIN EXHIBITION CURATOR
            </span>
            <h3 className="font-serif font-bold text-lg text-[#FFF4DC]">
              {photoToEdit ? 'Edit Exhibition Photograph' : 'Curate New Photograph'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Image URL Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 tracking-wide uppercase">
              Photo Image URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/university-photo.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#091734] focus:ring-1 focus:ring-[#091734]"
              required
            />
          </div>

          {/* Presets Quick Picker */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Sparkles size={12} className="text-amber-600" />
              <span>Or choose from curated university archive presets:</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_PHOTOS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(p)}
                  className={`group relative rounded-xl overflow-hidden aspect-video border text-left transition-all ${
                    imageUrl === p.url ? 'ring-2 ring-amber-500 border-amber-500' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={p.url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 p-1 flex items-end">
                    <span className="text-[9px] text-white font-medium line-clamp-1 leading-tight">{p.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Live Image Preview */}
          {imageUrl && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-600">Exhibition Preview:</span>
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 tracking-wide uppercase">
              Exhibition Title
            </label>
            <input
              type="text"
              placeholder="e.g. The Great Quadrangle at Dawn"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#091734] focus:ring-1 focus:ring-[#091734]"
            />
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 tracking-wide uppercase">
              Exhibition Caption / Note
            </label>
            <textarea
              rows={2}
              placeholder="A brief archival description or historic context of the photograph..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#091734] focus:ring-1 focus:ring-[#091734]"
            />
          </div>

          {/* Category & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 tracking-wide uppercase">
                Collection Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#091734]"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 tracking-wide uppercase">
                Campus Location
              </label>
              <input
                type="text"
                placeholder="e.g. Senate Assembly Hall"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#091734]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#091734] hover:bg-[#15274d] text-[#FFF4DC] font-bold px-5 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5 border border-amber-300/30"
            >
              <Check size={14} className="text-amber-300" />
              <span>{isSubmitting ? 'Cataloging...' : (photoToEdit ? 'Save Changes' : 'Publish to Exhibition')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
