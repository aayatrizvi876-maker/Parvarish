import React, { useState, useEffect } from 'react';
import { 
  CloseIcon, 
  LikeIcon, 
  ShareIcon, 
  TimeIcon, 
  EyeIcon, 
  EditIcon, 
  DeleteIcon 
} from '../icons/ParvarishIcons';
import { videoService } from '../../services/videoService';
import { CheckCircle2, Play, ExternalLink } from 'lucide-react';

export function VideoPlayerModal({ 
  video, 
  allVideos = [], 
  onClose, 
  onSelectVideo, 
  isAdmin = false,
  onEdit,
  onDelete 
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video?.likesCount || 0);
  const [isCopied, setIsCopied] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    if (video?.id) {
      setIsLiked(videoService.isLiked(video.id));
      setLikesCount(video.likesCount || 0);
      setShowFullDesc(false);
    }
  }, [video?.id]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  const handleToggleLike = async () => {
    try {
      const res = await videoService.toggleLikeVideo(video.id);
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShare = async () => {
    const shareUrl = video.youtubeUrl || `https://www.youtube.com/watch?v=${video.videoId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description?.substring(0, 100),
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch (e) {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const relatedVideos = allVideos.filter(v => v.id !== video.id).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-[#071F5C]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 md:p-8 animate-fade-in overflow-y-auto">
      
      {/* Click outside to close backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose}></div>

      {/* Main Player Container */}
      <div className="bg-[#FAF8F5] border border-amber-900/15 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative text-slate-900">
        
        {/* Header Bar */}
        <div className="bg-[#091734] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#15274d] shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#FFF4DC]/15 text-[#FFF4DC] border border-[#FFF4DC]/20">
              {video.category || 'Campus Video'}
            </span>
            <span className="text-xs text-[#C5A880] truncate font-serif italic hidden sm:inline">
              Parvarish Video Lounge
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Admin Controls in Player */}
            {isAdmin && (
              <div className="flex items-center space-x-1 mr-2 border-r border-slate-700 pr-2">
                <button
                  onClick={() => onEdit && onEdit(video)}
                  title="Edit video metadata"
                  className="p-1.5 rounded-lg text-amber-300 hover:text-amber-100 hover:bg-white/10 transition-colors"
                >
                  <EditIcon size={16} />
                </button>
                <button
                  onClick={() => onDelete && onDelete(video.id)}
                  title="Delete video"
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-200 hover:bg-white/10 transition-colors"
                >
                  <DeleteIcon size={16} />
                </button>
              </div>
            )}

            <a
              href={video.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              title="Open directly on YouTube"
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ExternalLink size={16} />
            </a>

            <button
              onClick={onClose}
              className="text-[#FFF4DC]/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Close Player (Esc)"
            >
              <CloseIcon size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body: Player + Metadata + Related */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* 16:9 YouTube Video Embed Container */}
          <div className="relative w-full rounded-2xl overflow-hidden shadow-xl bg-black border border-slate-800" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={video.title}
              className="absolute top-0 left-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Video Metadata & Actions Row */}
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-between">
            
            {/* Left Column: Title, Channel, Description */}
            <div className="flex-1 min-w-0 space-y-3">
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-[#091734] leading-snug">
                {video.title}
              </h1>

              {/* Channel and Publication Details */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pb-2 border-b border-amber-900/10">
                <div className="flex items-center space-x-1.5 bg-amber-50 text-amber-900 font-bold px-3 py-1 rounded-full border border-amber-200">
                  <span>{video.channelTitle || 'Parvarish University Channel'}</span>
                  <CheckCircle2 size={13} className="text-blue-900" />
                </div>

                <div className="flex items-center space-x-1 text-slate-500 font-medium">
                  <TimeIcon size={13} />
                  <span>{video.duration || '05:00'}</span>
                </div>

                <span className="text-slate-300">•</span>

                <div className="flex items-center space-x-1 text-slate-500">
                  <EyeIcon size={13} />
                  <span>{(video.viewsCount || 1).toLocaleString()} views</span>
                </div>

                <span className="text-slate-300">•</span>

                <span className="text-slate-500">
                  {new Date(video.publishedAt).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>

              {/* Description Box with Expand Toggle */}
              {video.description && (
                <div className="bg-white rounded-2xl p-4 border border-amber-900/10 shadow-xs text-xs text-slate-700 leading-relaxed font-sans">
                  <p className={showFullDesc ? '' : 'line-clamp-2'}>
                    {video.description}
                  </p>
                  {video.description.length > 130 && (
                    <button
                      onClick={() => setShowFullDesc(!showFullDesc)}
                      className="text-[#1E3A8A] font-bold mt-1.5 hover:underline block"
                    >
                      {showFullDesc ? 'Show less' : 'Read more...'}
                    </button>
                  )}
                </div>
              )}

              {/* Engagement Buttons */}
              <div className="flex items-center space-x-3 pt-1">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                    isLiked 
                      ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <LikeIcon size={16} liked={isLiked} />
                  <span>{likesCount} Likes</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-xs transition-all"
                >
                  <ShareIcon size={16} />
                  <span>{isCopied ? 'Link Copied! ✓' : 'Share Video'}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Next / Related Campus Videos */}
            {relatedVideos.length > 0 && (
              <div className="w-full lg:w-80 shrink-0 space-y-3 pt-2 lg:pt-0">
                <h3 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-700 border-b border-amber-900/10 pb-1.5">
                  More Campus Videos
                </h3>
                
                <div className="space-y-2.5">
                  {relatedVideos.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectVideo && onSelectVideo(item)}
                      className="bg-white hover:bg-amber-50/50 p-2 rounded-xl border border-amber-900/10 shadow-2xs cursor-pointer flex gap-3 group transition-all"
                    >
                      <div className="relative w-24 h-15 rounded-lg overflow-hidden shrink-0 bg-slate-900">
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 flex items-center justify-center transition-colors">
                          <div className="w-5 h-5 rounded-full bg-[#FFF4DC]/90 text-[#091734] flex items-center justify-center">
                            <Play size={10} className="fill-[#091734] ml-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded font-mono">
                          {item.duration || '05:00'}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif font-bold text-xs text-[#091734] line-clamp-2 leading-tight group-hover:text-[#1E3A8A]">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 truncate">
                          {item.channelTitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
