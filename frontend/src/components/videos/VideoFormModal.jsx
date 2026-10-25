import React, { useState, useEffect } from 'react';
import { 
  CloseIcon, 
  VideoIcon, 
  EyeIcon 
} from '../icons/ParvarishIcons';
import { 
  extractYouTubeId, 
  getYouTubeThumbnail, 
  fetchYouTubeMetadata, 
  videoService 
} from '../../services/videoService';
import { CheckCircle2, AlertCircle, Loader2, Sparkles, Youtube } from 'lucide-react';

export function VideoFormModal({ 
  isOpen, 
  videoToEdit = null, 
  onClose, 
  onSaved, 
  currentUser 
}) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Campus Life');
  const [channelTitle, setChannelTitle] = useState('Parvarish University Official');
  const [duration, setDuration] = useState('05:00');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [urlStatus, setUrlStatus] = useState('idle'); // 'idle' | 'valid' | 'invalid'

  const categories = [
    'Campus Life',
    'Research & Tech',
    'Announcements',
    'Keynotes & Talks',
    'Student Spotlight',
    'Cultural & Arts'
  ];

  // Initialize form state when opening or when videoToEdit changes
  useEffect(() => {
    if (videoToEdit) {
      setYoutubeUrl(videoToEdit.youtubeUrl || `https://www.youtube.com/watch?v=${videoToEdit.videoId}`);
      setVideoId(videoToEdit.videoId);
      setTitle(videoToEdit.title || '');
      setDescription(videoToEdit.description || '');
      setCategory(videoToEdit.category || 'Campus Life');
      setChannelTitle(videoToEdit.channelTitle || 'Parvarish University Official');
      setDuration(videoToEdit.duration || '05:00');
      setThumbnailUrl(videoToEdit.thumbnailUrl || getYouTubeThumbnail(videoToEdit.videoId, 'hq'));
      setIsFeatured(Boolean(videoToEdit.isFeatured));
      setUrlStatus('valid');
    } else {
      setYoutubeUrl('');
      setVideoId(null);
      setTitle('');
      setDescription('');
      setCategory('Campus Life');
      setChannelTitle('Parvarish University Official');
      setDuration('05:00');
      setThumbnailUrl('');
      setIsFeatured(false);
      setUrlStatus('idle');
    }
    setError(null);
  }, [videoToEdit, isOpen]);

  // Real-time URL parsing when user types/pastes URL
  const handleUrlChange = (value) => {
    setYoutubeUrl(value);
    setError(null);

    if (!value.trim()) {
      setVideoId(null);
      setUrlStatus('idle');
      return;
    }

    const extracted = extractYouTubeId(value);
    if (extracted) {
      setVideoId(extracted);
      setUrlStatus('valid');
      const thumb = getYouTubeThumbnail(extracted, 'hq');
      setThumbnailUrl(thumb);
    } else {
      setVideoId(null);
      setUrlStatus('invalid');
    }
  };

  // Auto-fetch Title & Channel Name from YouTube oEmbed API
  const handleAutoFetch = async () => {
    if (!videoId) {
      setError('Please enter a valid YouTube URL first.');
      return;
    }

    setIsFetchingMeta(true);
    setError(null);
    try {
      const meta = await fetchYouTubeMetadata(youtubeUrl);
      if (meta.title && !title) setTitle(meta.title);
      if (meta.channelTitle) setChannelTitle(meta.channelTitle);
      if (meta.thumbnailUrl) setThumbnailUrl(meta.thumbnailUrl);
    } catch (err) {
      setError('Could not auto-fetch metadata. You can enter title and channel manually.');
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoId) {
      setError('A valid YouTube URL or Shorts link is required.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title for the video.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        youtubeUrl: youtubeUrl.trim(),
        title: title.trim(),
        description: description.trim(),
        category,
        channelTitle: channelTitle.trim(),
        duration: duration.trim() || '05:00',
        thumbnailUrl: thumbnailUrl || getYouTubeThumbnail(videoId, 'hq'),
        isFeatured
      };

      let saved;
      if (videoToEdit) {
        saved = await videoService.updateVideo(videoToEdit.id, payload);
      } else {
        saved = await videoService.createVideo(payload, currentUser);
      }

      onSaved && onSaved(saved);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save video post.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#071F5C]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in overflow-y-auto">
      
      {/* Click outside to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose}></div>

      {/* Modal Dialog */}
      <div className="bg-[#FAF8F5] border border-amber-900/15 rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden relative text-slate-900 max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-[#091734] text-white px-6 py-4 flex items-center justify-between border-b border-[#15274d]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF4DC]/10 flex items-center justify-center text-[#FFF4DC]">
              <Youtube size={18} className="text-rose-400" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-base text-[#FFF4DC]">
                {videoToEdit ? 'Edit Campus Video' : 'Publish YouTube Video'}
              </h2>
              <p className="text-[11px] text-[#C5A880]">
                Official Video Navigation Lounge • Admin Studio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* YouTube URL Input & Auto-Detector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 font-serif">
                YouTube URL or Shorts Link *
              </label>
              {urlStatus === 'valid' && (
                <button
                  type="button"
                  onClick={handleAutoFetch}
                  disabled={isFetchingMeta}
                  className="text-[11px] text-[#1E3A8A] font-bold hover:underline flex items-center space-x-1"
                >
                  {isFetchingMeta ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Sparkles size={12} className="text-amber-600" />
                  )}
                  <span>Auto-fill details</span>
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/... or /shorts/..."
                value={youtubeUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-3 text-xs text-slate-900 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] shadow-2xs font-mono"
              />
              <div className="absolute right-3 top-3">
                {urlStatus === 'valid' && (
                  <span className="flex items-center space-x-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 size={13} />
                    <span>Valid ID: {videoId}</span>
                  </span>
                )}
                {urlStatus === 'invalid' && (
                  <span className="text-[11px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Invalid URL
                  </span>
                )}
              </div>
            </div>

            <p className="text-[10px] text-slate-500">
              Supports standard YouTube URLs, <code className="font-mono">youtu.be</code> shortlinks, and YouTube Shorts.
            </p>
          </div>

          {/* Live Thumbnail & Video ID Preview Card */}
          {videoId && (
            <div className="bg-white rounded-2xl p-3.5 border border-amber-900/10 shadow-2xs flex items-center gap-4 animate-fade-in">
              <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                <img
                  src={thumbnailUrl || getYouTubeThumbnail(videoId, 'hq')}
                  alt="YouTube Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Youtube size={22} className="text-white drop-shadow" />
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  YouTube Feed Preview
                </span>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {title || 'Title will appear here'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  Channel: {channelTitle} • Video ID: <span className="font-mono">{videoId}</span>
                </p>
              </div>
            </div>
          )}

          {/* Video Title */}
          <div>
            <label className="text-xs font-bold text-slate-800 font-serif block mb-1.5">
              Video Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Annual Convocation & Gold Medal Ceremony 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A8A] font-sans"
            />
          </div>

          {/* Category & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 font-serif block mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A8A]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 font-serif block mb-1.5">
                Duration (mm:ss)
              </label>
              <input
                type="text"
                placeholder="e.g. 12:45"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A8A] font-mono"
              />
            </div>
          </div>

          {/* Channel Name */}
          <div>
            <label className="text-xs font-bold text-slate-800 font-serif block mb-1.5">
              Channel / Publishing Entity
            </label>
            <input
              type="text"
              placeholder="e.g. Parvarish University Official or CSE Department"
              value={channelTitle}
              onChange={(e) => setChannelTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A8A]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-800 font-serif block mb-1.5">
              Video Description & Context
            </label>
            <textarea
              rows={3}
              placeholder="Provide background context, speaker details, or symposium overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-[#1E3A8A] leading-relaxed"
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
            <div>
              <span className="text-xs font-bold text-amber-900 block font-serif">
                Feature at Top of Video Lounge
              </span>
              <span className="text-[10px] text-amber-800/80">
                Gives the video prominent banner placement in the campus video stream.
              </span>
            </div>
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#1E3A8A] rounded"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving || !videoId || !title.trim()}
              className="bg-[#091734] hover:bg-[#15274d] disabled:opacity-50 text-[#FFF4DC] font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center space-x-2 border border-amber-300/40"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{videoToEdit ? 'Update Video' : 'Publish Video'}</span>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
