import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  VideoIcon, 
  ExploreIcon, 
  LikeIcon, 
  TimeIcon, 
  EyeIcon, 
  EditIcon, 
  DeleteIcon, 
  AddIcon, 
  RefreshIcon 
} from '../components/icons/ParvarishIcons';
import { videoService } from '../services/videoService';
import { VideoPlayerModal } from '../components/videos/VideoPlayerModal';
import { VideoFormModal } from '../components/videos/VideoFormModal';
import { Play, CheckCircle2, Shield, Youtube } from 'lucide-react';

export function VideosView() {
  const { user } = useAuth();
  
  // Access control: Only authorized admins (user?.role === 'ADMIN') see admin studio controls and management buttons
  const isAdmin = user?.role === 'ADMIN';

  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [activePlayerVideo, setActivePlayerVideo] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const categories = [
    'All',
    'Campus Life',
    'Research & Tech',
    'Keynotes & Talks',
    'Announcements',
    'Student Spotlight',
    'Cultural & Arts'
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadVideos = async () => {
    try {
      setIsLoading(true);
      const list = await videoService.getVideos({
        category: selectedCategory,
        search: searchQuery
      });
      setVideos(list);
    } catch (err) {
      console.error('Failed to load videos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, [selectedCategory, searchQuery]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campus video post?')) {
      try {
        await videoService.deleteVideo(id);
        if (activePlayerVideo?.id === id) setActivePlayerVideo(null);
        showToast('Video post deleted successfully.');
        loadVideos();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEdit = (video) => {
    setVideoToEdit(video);
    setIsFormModalOpen(true);
  };

  const handleSaved = (savedVideo) => {
    showToast(videoToEdit ? 'Video updated successfully.' : 'New video published to lounge.');
    setVideoToEdit(null);
    loadVideos();
    if (activePlayerVideo?.id === savedVideo.id) {
      setActivePlayerVideo(savedVideo);
    }
  };

  // Find featured video for the top banner if available
  const featuredVideo = videos.find(v => v.isFeatured) || (videos.length > 0 ? videos[0] : null);
  const regularVideos = videos.filter(v => v.id !== featuredVideo?.id);

  return (
    <div className="flex-1 bg-[#FAF8F5] min-h-screen pb-24 font-sans select-none">
      
      {/* Top Header Lounge Banner */}
      <div className="bg-[#091734] text-white pt-7 pb-8 px-5 lg:px-10 border-b border-[#15274d] relative overflow-hidden shadow-md">
        {/* Decorative Golden Ambient Blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A880]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[#C5A880] text-xs font-serif italic mb-1">
                <Youtube size={15} className="text-rose-400" />
                <span>The Official University Social Video Stream</span>
              </div>
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#FFF4DC] tracking-wide flex items-center gap-2.5">
                <VideoIcon size={28} selected={true} doorColor="#091734" spineColor="#091734" className="text-[#FFF4DC]" />
                <span>PARVARISH VIDEO LOUNGE</span>
              </h1>
              <p className="text-xs text-slate-300 font-serif max-w-xl mt-1.5 leading-relaxed">
                Watch official symposiums, campus heritage features, research breakthroughs, student showcases, and department announcements.
              </p>
            </div>

            {/* Header Right: Admin Studio Badge & Actions (Only visible to authorized Admin users) */}
            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
                <div className="flex items-center space-x-1.5 bg-[#C5A880]/20 text-[#FFF4DC] px-3.5 py-1.5 rounded-full border border-amber-300/30 text-xs font-semibold shadow-xs">
                  <Shield size={13} className="text-amber-300" />
                  <span>Admin Studio</span>
                </div>

                <button
                  onClick={() => {
                    setVideoToEdit(null);
                    setIsFormModalOpen(true);
                  }}
                  className="bg-[#FFF4DC] hover:bg-[#F6EEDB] text-[#091734] font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5 border border-amber-300"
                >
                  <AddIcon size={16} />
                  <span>Publish Video</span>
                </button>
              </div>
            )}
          </div>

          {/* Search Bar & Categories Row */}
          <div className="mt-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <ExploreIcon size={16} selected={false} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search campus videos, talks, lectures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white placeholder-slate-400 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-amber-300 focus:bg-white/15 transition-all shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all font-medium ${
                    selectedCategory === cat
                      ? 'bg-[#FFF4DC] text-[#091734] font-bold shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#091734] text-[#FFF4DC] text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 animate-bounce border border-amber-300/30">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-5 lg:px-10 py-6 space-y-7">
        
        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-slate-200/80 space-y-3">
                <div className="w-full h-44 bg-slate-200 rounded-2xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-amber-900/10 p-12 text-center my-6 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <Youtube size={28} />
            </div>
            <h3 className="font-serif font-bold text-slate-800 text-base">
              No Campus Videos Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-serif max-w-sm mx-auto">
              {searchQuery 
                ? `No videos match "${searchQuery}" in category "${selectedCategory}".` 
                : 'There are no videos published under this category yet.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => {
                  setVideoToEdit(null);
                  setIsFormModalOpen(true);
                }}
                className="mt-4 bg-[#091734] text-[#FFF4DC] text-xs font-bold px-4 py-2 rounded-xl shadow inline-flex items-center space-x-1.5"
              >
                <AddIcon size={16} />
                <span>Publish the First Video</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Top Featured Video Banner (If on 'All' and no search query) */}
            {selectedCategory === 'All' && !searchQuery && featuredVideo && (
              <div 
                onClick={() => setActivePlayerVideo(featuredVideo)}
                className="bg-white rounded-3xl border border-amber-900/15 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group relative"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  
                  {/* Left 7 cols: 16:9 Thumbnail with Overlay */}
                  <div className="lg:col-span-7 relative h-60 sm:h-72 lg:h-80 bg-slate-900 overflow-hidden">
                    <img
                      src={featuredVideo.thumbnailUrl}
                      alt={featuredVideo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* Centered Glowing Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-[#091734]/90 text-[#FFF4DC] flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 border-2 border-amber-300/40">
                        <Play size={26} className="fill-current ml-1" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <span className="absolute bottom-3 right-3 bg-black/85 text-white text-xs px-2.5 py-1 rounded-md font-mono font-semibold">
                      {featuredVideo.duration || '08:45'}
                    </span>

                    {/* Featured Tag */}
                    <span className="absolute top-3 left-3 bg-amber-500 text-[#091734] font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      ★ Featured Stream
                    </span>
                  </div>

                  {/* Right 5 cols: Video Metadata & Excerpt */}
                  <div className="lg:col-span-5 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 text-[11px] text-amber-800 font-bold uppercase tracking-wider mb-2">
                        <span>{featuredVideo.category}</span>
                        <span>•</span>
                        <span className="text-slate-400 font-normal">
                          {new Date(featuredVideo.publishedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#091734] leading-snug group-hover:text-[#1E3A8A] transition-colors mb-3">
                        {featuredVideo.title}
                      </h2>

                      <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed line-clamp-4 font-sans">
                        {featuredVideo.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-amber-900/10 mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
                        <span>{featuredVideo.channelTitle}</span>
                        <CheckCircle2 size={13} className="text-blue-900" />
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center space-x-1">
                          <LikeIcon size={14} liked={videoService.isLiked(featuredVideo.id)} />
                          <span>{featuredVideo.likesCount}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <EyeIcon size={14} />
                          <span>{featuredVideo.viewsCount}</span>
                        </span>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* Video Cards Grid */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="font-serif font-bold text-base text-[#091734]">
                  {selectedCategory === 'All' ? 'Campus Video Library' : `${selectedCategory} Videos`}
                </h3>
                <span className="text-xs text-slate-500">
                  {videos.length} {videos.length === 1 ? 'Video' : 'Videos'} available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((vid) => (
                  <article
                    key={vid.id}
                    onClick={() => setActivePlayerVideo(vid)}
                    className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* 16:9 Thumbnail with Overlay */}
                      <div className="relative w-full aspect-video bg-slate-900 overflow-hidden">
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80';
                          }}
                        />

                        {/* Hover Darken & Play Button */}
                        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 flex items-center justify-center transition-all">
                          <div className="w-12 h-12 rounded-full bg-[#091734]/90 text-[#FFF4DC] flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-rose-600 group-hover:text-white transition-all duration-300 border border-amber-200/40">
                            <Play size={18} className="fill-current ml-0.5" />
                          </div>
                        </div>

                        {/* Duration Pill */}
                        <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                          {vid.duration || '05:00'}
                        </span>

                        {/* Category Tag */}
                        <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FAF8F5]/90 text-[#091734] shadow-xs backdrop-blur-xs">
                          {vid.category}
                        </span>

                        {/* Admin Action Bar on Thumbnail */}
                        {isAdmin && (
                          <div 
                            onClick={(e) => e.stopPropagation()} 
                            className="absolute top-2.5 right-2.5 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-xs p-1 rounded-xl"
                          >
                            <button
                              onClick={() => handleEdit(vid)}
                              title="Edit Video"
                              className="p-1 rounded-lg text-amber-300 hover:text-white hover:bg-white/20 transition-colors"
                            >
                              <EditIcon size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(vid.id)}
                              title="Delete Video"
                              className="p-1 rounded-lg text-rose-400 hover:text-white hover:bg-white/20 transition-colors"
                            >
                              <DeleteIcon size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Card Content Body */}
                      <div className="p-4 sm:p-5">
                        <h4 className="font-serif font-bold text-sm sm:text-base text-[#091734] leading-snug group-hover:text-[#1E3A8A] transition-colors line-clamp-2">
                          {vid.title}
                        </h4>

                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {vid.description}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Bar */}
                    <div className="px-4 sm:px-5 pb-4 pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                      <div className="flex items-center space-x-1 font-semibold text-slate-700 truncate max-w-[60%]">
                        <span className="truncate">{vid.channelTitle}</span>
                        <CheckCircle2 size={12} className="text-blue-800 shrink-0" />
                      </div>

                      <div className="flex items-center space-x-3 shrink-0 text-[11px]">
                        <span className="flex items-center space-x-1">
                          <LikeIcon size={13} liked={videoService.isLiked(vid.id)} />
                          <span>{vid.likesCount || 0}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <EyeIcon size={13} />
                          <span>{vid.viewsCount || 1}</span>
                        </span>
                      </div>
                    </div>

                  </article>
                ))}
              </div>
            </div>
          </>
        )}

      </main>

      {/* Dedicated Video Player Modal */}
      {activePlayerVideo && (
        <VideoPlayerModal
          video={activePlayerVideo}
          allVideos={videos}
          onClose={() => setActivePlayerVideo(null)}
          onSelectVideo={(v) => setActivePlayerVideo(v)}
          isAdmin={isAdmin}
          onEdit={(v) => {
            handleEdit(v);
          }}
          onDelete={(id) => {
            handleDelete(id);
          }}
        />
      )}

      {/* Admin Video Create / Edit Modal */}
      <VideoFormModal
        isOpen={isFormModalOpen}
        videoToEdit={videoToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setVideoToEdit(null);
        }}
        onSaved={handleSaved}
        currentUser={user}
      />

    </div>
  );
}
