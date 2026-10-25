import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ExploreIcon,
  LikeIcon,
  CommentIcon,
  SaveIcon,
  ShareIcon,
  MoreIcon,
  RefreshIcon,
  NotificationIcon,
  AnnouncementIcon,
  LinkIcon,
  EyeIcon
} from '../components/icons/ParvarishIcons';
import { Moon, Sun, ChevronDown, CheckCircle2, Send, X } from 'lucide-react';

export function HomeView({ onOpenPost, onOpenProfile, onOpenNotifications, unreadCount = 0 }) {
  const { user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeMenuPostId, setActiveMenuPostId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Direct Inline Social Interaction States
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState(null);
  const [commentsByPost, setCommentsByPost] = useState({});
  const [loadingCommentsPostId, setLoadingCommentsPostId] = useState(null);
  const [commentInputByPost, setCommentInputByPost] = useState({});
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [expandedContentIds, setExpandedContentIds] = useState(new Set());

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const fetchFeed = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getPosts({ search: searchQuery });
      setPosts(data.posts || []);
    } catch (err) {
      setError('Unable to load feed.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchFeed();
  };

  const handleToggleLike = async (e, post) => {
    e.stopPropagation();
    try {
      if (post.isLikedByMe) {
        setPosts(posts.map(p => p.id === post.id ? { ...p, isLikedByMe: false, likesCount: Math.max(0, (p.likesCount || 1) - 1) } : p));
        await api.unlikePost(post.id);
      } else {
        setPosts(posts.map(p => p.id === post.id ? { ...p, isLikedByMe: true, likesCount: (p.likesCount || 0) + 1 } : p));
        await api.likePost(post.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSave = async (e, post) => {
    e.stopPropagation();
    try {
      if (post.isSavedByMe) {
        setPosts(posts.map(p => p.id === post.id ? { ...p, isSavedByMe: false } : p));
        await api.unsavePost(post.id);
        showToast('Removed from saved posts');
      } else {
        setPosts(posts.map(p => p.id === post.id ? { ...p, isSavedByMe: true } : p));
        await api.savePost(post.id);
        showToast('Saved to your bookmarks!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShare = async (e, post) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100),
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/#post-${post.id}`);
        showToast('Article link copied to clipboard!');
      }
    } catch (err) {
      showToast('Article link copied to clipboard!');
    }
  };

  const handleToggleComments = async (e, post) => {
    e.stopPropagation();
    if (expandedCommentsPostId === post.id) {
      setExpandedCommentsPostId(null);
      return;
    }
    setExpandedCommentsPostId(post.id);
    if (!commentsByPost[post.id]) {
      try {
        setLoadingCommentsPostId(post.id);
        const res = await api.getComments(post.id);
        setCommentsByPost(prev => ({ ...prev, [post.id]: res.comments || [] }));
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoadingCommentsPostId(null);
      }
    }
  };

  const handleAddInlineComment = async (e, post) => {
    e.preventDefault();
    e.stopPropagation();
    const text = (commentInputByPost[post.id] || '').trim();
    if (!text || isSubmittingComment) return;

    try {
      setIsSubmittingComment(true);
      const res = await api.addComment(post.id, text);
      const newComment = res.comment || {
        id: 'cmt_' + Date.now(),
        content: text,
        createdAt: new Date().toISOString(),
        author: {
          id: user?.id,
          name: user?.name || 'You',
          profileImage: user?.profileImage,
          department: user?.department,
          isVerified: user?.role === 'ADMIN'
        },
        likesCount: 0,
        isLikedByMe: false
      };

      setCommentsByPost(prev => ({
        ...prev,
        [post.id]: [...(prev[post.id] || []), newComment]
      }));

      // Increment comments count on the post
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, commentsCount: (p.commentsCount || 0) + 1 } : p));
      
      // Clear input
      setCommentInputByPost(prev => ({ ...prev, [post.id]: '' }));
      showToast('Comment posted!');
    } catch (err) {
      console.error(err);
      showToast('Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleContentExpand = (e, postId) => {
    e.stopPropagation();
    setExpandedContentIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  // Consistent real counts without discrepancies
  const getDisplayLikes = (post) => post.likesCount ?? 0;
  const getDisplayComments = (post) => post.commentsCount ?? 0;

  const formatDisplayDate = (post) => {
    if (post.id === 'post_001') return '1 Sept';
    if (post.id === 'post_002') return '3 Sept';
    if (post.id === 'post_003') return '2 Sept';
    if (post.publishedAt) {
      const d = new Date(post.publishedAt);
      return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
    }
    return '1 Sept';
  };

  const getCategoryBadgeLabel = (post) => {
    if (post.subCategory) return post.subCategory.toUpperCase();
    if (post.categoryId === 'announcements') return 'ANNOUNCEMENTS';
    if (post.categoryId === 'student_spotlight') return 'STUDENT SPOTLIGHT';
    if (post.categoryId === 'events') return 'EVENTS';
    if (post.categoryId === 'achievements') return 'ACHIEVEMENTS';
    return (post.categoryId || 'GENERAL').toUpperCase();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAF8F5] min-h-screen font-sans">
      
      {/* Top Header Bar: Clean Search Bar + Theme Toggle + User Avatar */}
      <header className="sticky top-0 z-20 bg-[#FAF8F5]/95 backdrop-blur-md px-6 lg:px-10 py-4 border-b border-amber-900/10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <ExploreIcon size={16} selected={false} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles, people, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/90 text-xs text-slate-800 placeholder-slate-400 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-[#1E3A8A] shadow-2xs transition-all"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3">
            {/* Notification Bell with Unread Indicator */}
            <button 
              onClick={() => onOpenNotifications && onOpenNotifications()}
              title="Notifications"
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            >
              <NotificationIcon size={19} hasUnread={unreadCount > 0} />
            </button>

            <button 
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              {isDark ? (
                <Sun size={18} className="text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon size={18} className="text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            <button 
              onClick={() => onOpenProfile && onOpenProfile(user?.id)}
              className="flex items-center space-x-1.5 p-1 rounded-full hover:bg-slate-200/50 transition-colors group"
            >
              <img
                src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name || 'User Profile'}
                className="w-8 h-8 rounded-full object-cover border-2 border-amber-300 shadow-2xs group-hover:scale-105 transition-transform"
              />
              <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-800 transition-colors" />
            </button>
          </div>

        </div>
      </header>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#091734] text-[#FFF4DC] text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Feed Canvas */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 lg:px-10 py-6 space-y-6">
        
        {/* Feed Status / Refresh Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-serif px-1">
          <span className="italic">Latest Official Publications & Highlights</span>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1.5 text-[#1E3A8A] hover:underline font-sans font-medium"
          >
            <RefreshIcon size={14} spinning={isRefreshing} className="text-[#1E3A8A]" />
            <span>Refresh Feed</span>
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-2xl text-center font-serif">
            {error}
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200/70 p-6 sm:p-7 shadow-xs animate-pulse flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="h-5 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-16 bg-slate-200 rounded"></div>
                </div>
                <div className="w-full md:w-80 h-48 bg-slate-200 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-amber-900/10 p-12 text-center my-6 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto mb-3">
              <AnnouncementIcon size={26} />
            </div>
            <h3 className="font-serif font-bold text-slate-800 text-base">No Publications Found</h3>
            <p className="text-xs text-slate-500 mt-1 font-serif">
              {searchQuery ? `No updates found for "${searchQuery}".` : 'There are no published updates in this section yet.'}
            </p>
          </div>
        ) : (
          posts.map((post) => {
            const authorName = post.author?.name || 'Prof. Dr. Anand Kumar Gupta';
            const isHodAuthor = post.author?.designation?.includes('Head of Department') || post.author?.id === 'usr_hod_official_001';
            const authorSubtitle = isHodAuthor 
              ? `Head of Department · ${formatDisplayDate(post)}`
              : (post.author?.designation ? `${post.author.designation} · ${formatDisplayDate(post)}` : formatDisplayDate(post));

            return (
              <article
                key={post.id}
                className="bg-white dark:bg-[#0F1A2E] rounded-3xl border border-slate-200/80 dark:border-[#1F304E] p-6 sm:p-7 shadow-xs hover:shadow-sm transition-all cursor-default relative group"
              >
                <div className="flex flex-col-reverse md:flex-row gap-6 items-start justify-between">
                  
                  {/* Left Column: Author, Title, Excerpt, Action Bar */}
                  <div className="flex-1 flex flex-col justify-between min-w-0 pr-0 md:pr-2 w-full">
                    <div>
                      
                      {/* Author Header Bar */}
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={post.author?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'}
                          alt={authorName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-700 shadow-2xs shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-sm text-[#0B1B3D] dark:text-[#F8FAFC] tracking-tight truncate">
                              {authorName}
                            </span>
                            {/* Blue Verified Badge */}
                            {(post.author?.isVerified || isHodAuthor) && (
                              <svg className="w-4 h-4 text-[#2563EB] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {authorSubtitle}
                          </p>
                        </div>
                      </div>

                      {/* Post Title */}
                      <h2 className="font-serif text-lg sm:text-xl font-bold text-[#0B1B3D] dark:text-[#F8FAFC] mb-2 leading-snug">
                        {post.title}
                      </h2>

                      {/* Post Content with Expand/Collapse */}
                      <p className={`text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-sans mb-1 ${
                        expandedContentIds.has(post.id) ? '' : 'line-clamp-3 sm:line-clamp-4'
                      }`}>
                        {post.content}
                      </p>
                      {post.content && post.content.length > 180 && (
                        <button
                          type="button"
                          onClick={(e) => toggleContentExpand(e, post.id)}
                          className="text-[11px] font-semibold text-[#1E3A8A] dark:text-amber-400 hover:underline mb-4 cursor-pointer inline-block"
                        >
                          {expandedContentIds.has(post.id) ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>

                    {/* Bottom Action Bar: Like, Comment, Share, Save */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-6">
                        
                        {/* Red Heart Likes */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleLike(e, post)}
                          className={`flex items-center space-x-1.5 text-xs font-semibold transition-colors group/like cursor-pointer ${
                            post.isLikedByMe ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400'
                          }`}
                        >
                          <LikeIcon 
                            size={18} 
                            liked={post.isLikedByMe}
                            className="group-hover/like:scale-115 active:scale-90 transition-transform" 
                          />
                          <span>{getDisplayLikes(post)}</span>
                        </button>

                        {/* Comments Toggle */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleComments(e, post)}
                          className={`flex items-center space-x-1.5 text-xs font-semibold transition-colors group/cmt cursor-pointer ${
                            expandedCommentsPostId === post.id 
                              ? 'text-[#0B1B3D] dark:text-[#F5EEDC] font-bold' 
                              : 'text-slate-600 dark:text-slate-300 hover:text-[#0B1B3D] dark:hover:text-[#F8FAFC]'
                          }`}
                        >
                          <CommentIcon size={18} className="text-slate-500 dark:text-slate-400 group-hover/cmt:text-[#0B1B3D] dark:group-hover/cmt:text-[#F8FAFC] transition-colors" />
                          <span>{getDisplayComments(post)}</span>
                        </button>

                        {/* Share / Send Airplane */}
                        <button
                          type="button"
                          onClick={(e) => handleShare(e, post)}
                          title="Share"
                          className="text-slate-500 dark:text-slate-400 hover:text-[#0B1B3D] dark:hover:text-[#F8FAFC] transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#16243D] cursor-pointer"
                        >
                          <ShareIcon size={17} />
                        </button>

                      </div>

                      {/* Bookmark Icon */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(e, post)}
                        title={post.isSavedByMe ? "Saved" : "Save to bookmarks"}
                        className="text-slate-400 hover:text-[#0B1B3D] dark:hover:text-[#F8FAFC] transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#16243D] cursor-pointer"
                      >
                        <SaveIcon 
                          size={19} 
                          saved={post.isSavedByMe}
                          className={post.isSavedByMe ? "text-[#0B1B3D] dark:text-amber-400" : "text-slate-400"} 
                        />
                      </button>

                    </div>
                  </div>

                  {/* Right Column: Category Badge + 3-dots Menu + Featured Thumbnail Image */}
                  <div className="w-full md:w-80 shrink-0 flex flex-col">
                    
                    {/* Category Pill Badge + Three Dots Menu */}
                    <div className="flex items-center justify-end space-x-3 mb-2.5 relative">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-[#FDF6E2] dark:bg-amber-950/40 text-[#9A6B38] dark:text-amber-400 border border-[#F3E7C4] dark:border-amber-800/40">
                        {getCategoryBadgeLabel(post)}
                      </span>
                      <div className="relative">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id);
                          }}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#16243D] transition-colors cursor-pointer"
                          title="More options"
                        >
                          <MoreIcon size={18} />
                        </button>

                        {/* Dropdown Menu for Post Options */}
                        {activeMenuPostId === post.id && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-9 w-44 bg-white dark:bg-[#16243D] rounded-2xl shadow-xl border border-slate-200/80 dark:border-[#1F304E] py-1.5 z-30 text-xs font-sans animate-fade-in"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                handleShare(e, post);
                                setActiveMenuPostId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-[#1F304E] flex items-center space-x-2.5 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                              <LinkIcon size={15} className="text-slate-400" />
                              <span>Copy Article Link</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                toggleContentExpand(e, post.id);
                                setActiveMenuPostId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-[#1F304E] flex items-center space-x-2.5 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                              <EyeIcon size={15} className="text-slate-400" />
                              <span>{expandedContentIds.has(post.id) ? 'Collapse Article' : 'Read Full Article'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Featured Image / Video Thumbnail */}
                    {post.mediaUrl && (
                      <div className="w-full h-44 sm:h-48 md:h-52 rounded-2xl overflow-hidden shadow-2xs bg-slate-100 dark:bg-slate-800 relative group/thumb">
                        <img
                          src={post.mediaUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500"
                        />
                        {post.mediaType === 'youtube' && (
                          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-[#091734]/90 text-[#FFF4DC] flex items-center justify-center shadow-lg group-hover/thumb:bg-rose-600 group-hover/thumb:text-white transition-all duration-300 border border-amber-200/50">
                              <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </div>

                {/* Inline Comments Drawer */}
                {expandedCommentsPostId === post.id && (
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[#1F304E] animate-fadeIn">
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-bold text-[#0B1B3D] dark:text-[#F8FAFC]">
                        Discussion ({getDisplayComments(post)})
                      </span>
                      <button
                        type="button"
                        onClick={() => setExpandedCommentsPostId(null)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Hide</span>
                        <X size={14} />
                      </button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 mb-3.5">
                      {loadingCommentsPostId === post.id ? (
                        <div className="text-center py-4 text-xs text-slate-400">Loading comments...</div>
                      ) : (commentsByPost[post.id] || []).length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400 dark:text-slate-500 bg-slate-50/70 dark:bg-[#13213B] rounded-xl">
                          No comments yet. Start the conversation!
                        </div>
                      ) : (
                        (commentsByPost[post.id] || []).map((cmt) => (
                          <div key={cmt.id} className="flex space-x-2.5 bg-slate-50/90 dark:bg-[#13213B] p-3 rounded-2xl border border-slate-100 dark:border-[#1F304E]">
                            <img
                              src={cmt.author?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                              alt={cmt.author?.name || 'User'}
                              className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-bold text-xs text-[#0B1B3D] dark:text-[#F8FAFC] truncate">
                                    {cmt.author?.name || 'Academic Member'}
                                  </span>
                                  {cmt.author?.isVerified && (
                                    <CheckCircle2 size={12} className="text-[#2563EB]" />
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-400">
                                  {cmt.createdAt ? new Date(cmt.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Recently'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-200 mt-1 leading-relaxed break-words">
                                {cmt.content}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Inline New Comment Input Form */}
                    <form 
                      onSubmit={(e) => handleAddInlineComment(e, post)}
                      className="flex items-center space-x-2.5 pt-1"
                    >
                      <img
                        src={user?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={user?.name || 'Me'}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInputByPost[post.id] || ''}
                          onChange={(e) => setCommentInputByPost({ ...commentInputByPost, [post.id]: e.target.value })}
                          className="w-full bg-[#FAF8F5] dark:bg-[#13213B] border border-slate-200/90 dark:border-[#233758] rounded-full px-4 py-2 text-xs text-slate-800 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#091734] dark:focus:border-amber-400 transition-all pr-10"
                        />
                        <button
                          type="submit"
                          disabled={!commentInputByPost[post.id]?.trim() || isSubmittingComment}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#091734] dark:bg-amber-400 text-white dark:text-[#0B1B3A] flex items-center justify-center hover:bg-[#152852] dark:hover:bg-amber-300 disabled:opacity-30 disabled:hover:bg-[#091734] transition-all cursor-pointer"
                        >
                          <Send size={13} className="ml-0.5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </article>
            );
          })
        )}

      </main>

    </div>
  );
}
