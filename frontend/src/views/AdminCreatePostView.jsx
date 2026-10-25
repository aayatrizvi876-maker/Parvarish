import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BackIcon, 
  EyeIcon, 
  AttachmentIcon, 
  CommentIcon, 
  SaveIcon, 
  ForwardIcon, 
  VideoIcon 
} from '../components/icons/ParvarishIcons';
import { 
  extractYouTubeId, 
  getYouTubeThumbnail, 
  fetchYouTubeMetadata, 
  videoService 
} from '../services/videoService';
import { 
  FileText, 
  Image as ImageIcon, 
  Youtube, 
  Pin, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Loader2 
} from 'lucide-react';

export function AdminCreatePostView({ onPostPublished, onCancel }) {
  const { user } = useAuth();
  
  // Post Type: 'text' | 'image' | 'video'
  const [postType, setPostType] = useState('text');

  // Common Post Fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('announcements');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [commentsEnabled, setCommentsEnabled] = useState(true);

  // YouTube Specific Fields
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState(null);
  const [youtubeChannel, setYoutubeChannel] = useState('Parvarish University Official');
  const [youtubeDuration, setYoutubeDuration] = useState('05:00');
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [urlStatus, setUrlStatus] = useState('idle'); // 'idle' | 'valid' | 'invalid'

  // View States
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const categories = [
    { id: 'announcements', label: '📢 Announcements' },
    { id: 'achievements', label: '🏆 Achievements' },
    { id: 'academic', label: '📚 Academic' },
    { id: 'events', label: '🎉 Events' },
    { id: 'opportunities', label: '💼 Opportunities' },
    { id: 'memories', label: '📸 Memories' }
  ];

  // Handle YouTube URL change & real-time ID extraction
  const handleYouTubeUrlChange = (value) => {
    setYoutubeUrl(value);
    setError(null);

    if (!value.trim()) {
      setYoutubeVideoId(null);
      setUrlStatus('idle');
      return;
    }

    const id = extractYouTubeId(value);
    if (id) {
      setYoutubeVideoId(id);
      setUrlStatus('valid');
      const thumb = getYouTubeThumbnail(id, 'hq');
      setMediaUrl(thumb);
    } else {
      setYoutubeVideoId(null);
      setUrlStatus('invalid');
    }
  };

  // Auto-fetch YouTube Title & Channel
  const handleAutoFetchMeta = async () => {
    if (!youtubeVideoId) {
      setError('Please enter a valid YouTube URL first.');
      return;
    }

    setIsFetchingMeta(true);
    setError(null);
    try {
      const meta = await fetchYouTubeMetadata(youtubeUrl);
      if (meta.title && !title) setTitle(meta.title);
      if (meta.channelTitle) setYoutubeChannel(meta.channelTitle);
      if (meta.thumbnailUrl) setMediaUrl(meta.thumbnailUrl);
    } catch (err) {
      setError('Could not auto-fetch metadata. You can enter details manually.');
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await api.uploadFile(file);
      if (type === 'media') {
        setMediaUrl(res.fileUrl);
        setMediaType(res.mediaType);
      } else {
        setAttachmentUrl(res.fileUrl);
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handlePublish = async (statusChoice = 'PUBLISHED') => {
    if (!title.trim()) {
      setError('Post title is required.');
      return;
    }
    if (postType === 'video' && !youtubeVideoId) {
      setError('Please provide a valid YouTube video URL for a video post.');
      return;
    }
    if (postType !== 'video' && !content.trim()) {
      setError('Post content is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      let finalMediaUrl = mediaUrl;
      let finalMediaType = mediaType;

      if (postType === 'video') {
        finalMediaType = 'youtube';
        finalMediaUrl = mediaUrl || getYouTubeThumbnail(youtubeVideoId, 'hq');

        // Also add to videoService store so it appears in the Video navigation tab immediately
        await videoService.createVideo({
          youtubeUrl: youtubeUrl.trim(),
          title: title.trim(),
          description: content.trim() || title.trim(),
          category: categoryId === 'events' ? 'Campus Life' : categoryId === 'achievements' ? 'Student Spotlight' : 'Announcements',
          channelTitle: youtubeChannel.trim(),
          duration: youtubeDuration.trim() || '05:00',
          thumbnailUrl: finalMediaUrl
        }, user);
      } else if (postType === 'text') {
        finalMediaUrl = null;
        finalMediaType = null;
      }

      await api.createPost({
        title: title.trim(),
        content: content.trim() || (postType === 'video' ? `Watch the official video on ${youtubeChannel}.` : ''),
        categoryId,
        mediaUrl: finalMediaUrl || null,
        mediaType: finalMediaType,
        youtubeUrl: postType === 'video' ? youtubeUrl.trim() : null,
        attachmentUrl: attachmentUrl || null,
        status: statusChoice,
        isPinned,
        commentsEnabled
      });

      setSuccessMsg(`Post ${statusChoice.toLowerCase()} successfully under HOD identity.`);
      setTimeout(() => {
        if (onPostPublished) onPostPublished();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to publish post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-100 min-h-screen p-4 pb-16 animate-fade-in space-y-4">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          {onCancel && (
            <button onClick={onCancel} className="p-1 text-slate-500 hover:text-slate-900">
              <BackIcon size={18} />
            </button>
          )}
          <h2 className="font-serif-title text-base font-bold text-slate-900">
            Publish Official Update
          </h2>
        </div>

        <button
          onClick={() => setIsPreview(!isPreview)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center space-x-1.5 border transition-colors ${
            isPreview ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}
        >
          <EyeIcon size={14} />
          <span>{isPreview ? 'Edit Mode' : 'Live Preview'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3.5 rounded-2xl flex items-center space-x-2">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-900 text-white text-xs p-3.5 rounded-xl text-center shadow-lg font-semibold animate-fade-in">
          {successMsg}
        </div>
      )}

      {/* Live Preview Mode Overlay */}
      {isPreview ? (
        <div className="bg-white p-5 rounded-3xl border border-slate-300 shadow-lg space-y-4">
          <div className="flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded w-max border border-emerald-200">
            <span>Author Preview • {postType.toUpperCase()} POST</span>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <img 
              src={user?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'} 
              alt={user?.name} 
              className="w-10 h-10 rounded-full object-cover border border-emerald-500 shadow-2xs" 
            />
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-bold text-sm text-slate-900">{user?.name}</span>
                <CheckCircle2 size={15} className="text-emerald-600 fill-emerald-100" />
              </div>
              <p className="text-xs text-slate-500 font-medium">{user?.designation || 'Head of Department'}</p>
            </div>
          </div>

          <h3 className="font-serif-title font-bold text-xl text-slate-900 leading-snug">
            {title || 'Untitled Post Title'}
          </h3>

          <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
            {content || 'Official post body text will appear here...'}
          </p>

          {/* Video Preview Card */}
          {postType === 'video' && youtubeVideoId && (
            <div className="rounded-2xl overflow-hidden border border-slate-300 shadow-sm relative aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                title={title}
                className="w-full h-full border-0"
                allowFullScreen
              />
            </div>
          )}

          {/* Image Preview */}
          {postType === 'image' && mediaUrl && (
            <img src={mediaUrl} alt="Preview" className="w-full h-52 object-cover rounded-2xl border" />
          )}
        </div>
      ) : (
        /* Post Editor Form */
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          
          {/* Post Type Selector Tabs: Text, Image, or YouTube Video */}
          <div>
            <label className="text-xs font-bold text-slate-800 font-serif block mb-2">
              Select Post Format *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPostType('text')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                  postType === 'text'
                    ? 'bg-[#091734] text-[#FFF4DC] border-[#091734] shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <FileText size={18} />
                <span>Text Notice</span>
              </button>

              <button
                type="button"
                onClick={() => setPostType('image')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                  postType === 'image'
                    ? 'bg-[#091734] text-[#FFF4DC] border-[#091734] shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <ImageIcon size={18} />
                <span>Image Article</span>
              </button>

              <button
                type="button"
                onClick={() => setPostType('video')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                  postType === 'video'
                    ? 'bg-[#091734] text-[#FFF4DC] border-[#091734] shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Youtube size={18} className="text-rose-500" />
                <span>YouTube Video</span>
              </button>
            </div>
          </div>

          {/* YouTube Video Specific Section */}
          {postType === 'video' && (
            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 font-serif flex items-center space-x-1.5">
                  <Youtube size={16} className="text-rose-600" />
                  <span>YouTube Stream Integration</span>
                </span>
                {urlStatus === 'valid' && (
                  <button
                    type="button"
                    onClick={handleAutoFetchMeta}
                    disabled={isFetchingMeta}
                    className="text-[11px] text-[#1E3A8A] font-bold hover:underline flex items-center space-x-1"
                  >
                    {isFetchingMeta ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} className="text-amber-600" />
                    )}
                    <span>Auto-fetch video info</span>
                  </button>
                )}
              </div>

              {/* YouTube URL Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Paste YouTube video, youtu.be, or Shorts URL..."
                  value={youtubeUrl}
                  onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                  className="w-full bg-white border border-amber-900/20 text-xs text-slate-900 rounded-xl p-3 pr-24 outline-none focus:border-[#1E3A8A] font-mono shadow-2xs"
                />
                <div className="absolute right-2.5 top-2.5">
                  {urlStatus === 'valid' && (
                    <span className="flex items-center space-x-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                      <CheckCircle2 size={12} />
                      <span>ID: {youtubeVideoId}</span>
                    </span>
                  )}
                  {urlStatus === 'invalid' && (
                    <span className="text-[10px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      Invalid URL
                    </span>
                  )}
                </div>
              </div>

              {/* Live Thumbnail Preview */}
              {youtubeVideoId && (
                <div className="bg-white p-3 rounded-xl border border-amber-200 flex items-center gap-3">
                  <img
                    src={mediaUrl || getYouTubeThumbnail(youtubeVideoId, 'hq')}
                    alt="YouTube Thumbnail"
                    className="w-24 h-16 rounded-lg object-cover bg-slate-900 shrink-0"
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Extracted Thumbnail</span>
                    <p className="font-semibold text-slate-800 truncate">{title || 'Video Title'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{youtubeChannel}</p>
                  </div>
                </div>
              )}

              {/* Video Channel & Duration Row */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Channel Name</label>
                  <input
                    type="text"
                    value={youtubeChannel}
                    onChange={(e) => setYoutubeChannel(e.target.value)}
                    placeholder="e.g. Parvarish University Official"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Duration (mm:ss)</label>
                  <input
                    type="text"
                    value={youtubeDuration}
                    onChange={(e) => setYoutubeDuration(e.target.value)}
                    placeholder="e.g. 08:45"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-800 font-serif block mb-1">
              Post Title *
            </label>
            <input
              type="text"
              placeholder={postType === 'video' ? 'e.g. Department Keynote & Research Symposium 2026' : 'e.g. Academic Notice: Mid-Semester Schedule'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 rounded-xl p-3 outline-none focus:border-[#1E3A8A]"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="text-xs font-bold text-slate-800 font-serif block mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-900 rounded-xl p-2.5 outline-none focus:border-[#1E3A8A]"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Content Body */}
          <div>
            <label className="text-xs font-bold text-slate-800 font-serif block mb-1">
              {postType === 'video' ? 'Video Synopsis & Notes' : 'Official Content Body *'}
            </label>
            <textarea
              rows={4}
              placeholder={postType === 'video' ? 'Provide background context or highlights covered in this YouTube video...' : 'Write the official announcement body here...'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 text-xs text-slate-900 rounded-xl p-3 outline-none focus:border-[#1E3A8A] font-normal leading-relaxed"
            />
          </div>

          {/* Media & Attachment Inputs (For Image/Text Posts) */}
          {postType === 'image' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 font-serif block mb-1">
                Featured Article Image
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="p-3 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center text-center">
                  <ImageIcon size={20} className="text-emerald-600 mb-1" />
                  <span className="text-[11px] font-semibold text-slate-700">Upload Image File</span>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'media')} className="hidden" />
                </label>

                <input
                  type="text"
                  placeholder="Or paste external image URL..."
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 outline-none self-center"
                />
              </div>

              {mediaUrl && (
                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200 truncate">
                  Image attached: {mediaUrl}
                </div>
              )}
            </div>
          )}

          {/* Document Attachment (PDF) */}
          <div className="pt-1">
            <label className="p-2.5 rounded-xl border border-dashed border-slate-300 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center space-x-2">
                <AttachmentIcon size={16} className="text-teal-600" />
                <span className="font-semibold text-[11px]">
                  {attachmentUrl ? 'Document attached (PDF)' : 'Attach Official Department Document (PDF optional)'}
                </span>
              </div>
              <input type="file" accept="application/pdf" onChange={(e) => handleFileUpload(e, 'doc')} className="hidden" />
              <span className="text-[10px] text-slate-400">Choose file</span>
            </label>
          </div>

          {/* Configuration Switches */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                <Pin size={15} className="rotate-45 text-amber-600" />
                <span>Pin Post to Top of Feed</span>
              </div>
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 accent-[#1E3A8A] rounded"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                <CommentIcon size={15} className="text-[#1E3A8A]" />
                <span>Enable Community Comments</span>
              </div>
              <input
                type="checkbox"
                checked={commentsEnabled}
                onChange={(e) => setCommentsEnabled(e.target.checked)}
                className="w-4 h-4 accent-[#1E3A8A] rounded"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center space-x-3">
            <button
              onClick={() => handlePublish('DRAFT')}
              disabled={isSubmitting}
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-3 rounded-2xl text-xs flex items-center justify-center space-x-1.5 transition-colors"
            >
              <SaveIcon size={14} />
              <span>Save Draft</span>
            </button>

            <button
              onClick={() => handlePublish('PUBLISHED')}
              disabled={isSubmitting}
              className="flex-1 bg-[#091734] hover:bg-[#15274d] text-[#FFF4DC] font-bold py-3 px-3 rounded-2xl text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-blue-950/20 transition-all border border-amber-300/30"
            >
              <ForwardIcon size={14} />
              <span>Publish Now</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
