import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BackIcon, 
  CloseIcon, 
  LikeIcon, 
  CommentIcon, 
  ShareIcon, 
  AttachmentIcon, 
  ForwardIcon 
} from '../components/icons/ParvarishIcons';
import { extractYouTubeId } from '../services/videoService';
import { CheckCircle2, CornerDownRight, Flag, AlertTriangle, ShieldCheck } from 'lucide-react';

export function PostDetailModal({ postId, onClose, onOpenProfile }) {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportingCommentId, setReportingCommentId] = useState(null);
  const [reportReason, setReportReason] = useState('Inappropriate content');
  const [toastMessage, setToastMessage] = useState(null);

  const fetchPostDetails = async () => {
    try {
      setIsLoading(true);
      const postRes = await api.getPostById(postId);
      setPost(postRes.post);
      const commentsRes = await api.getComments(postId);
      setComments(commentsRes.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchPostDetails();
  }, [postId]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLikePost = async () => {
    if (!post) return;
    try {
      if (post.isLikedByMe) {
        setPost({ ...post, isLikedByMe: false, likesCount: Math.max(0, post.likesCount - 1) });
        await api.unlikePost(postId);
      } else {
        setPost({ ...post, isLikedByMe: true, likesCount: post.likesCount + 1 });
        await api.likePost(postId);
      }
    } catch (err) {
      fetchPostDetails();
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await api.addComment(postId, newComment.trim(), replyingTo ? replyingTo.id : null);
      setNewComment('');
      setReplyingTo(null);
      showToast('Comment submitted');
      fetchPostDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLikeComment = async (commentId, currentIsLiked) => {
    try {
      if (currentIsLiked) {
        await api.unlikeComment(commentId);
      } else {
        await api.likeComment(commentId);
      }
      fetchPostDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportCommentSubmit = async () => {
    if (!reportingCommentId) return;
    try {
      await api.reportComment(reportingCommentId, reportReason);
      setReportingCommentId(null);
      showToast('Comment reported to HOD Moderation');
      fetchPostDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!postId) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-center animate-fade-in overflow-hidden">
      <div className="bg-slate-50 w-full max-w-md h-full flex flex-col relative shadow-2xl">
        
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
            title="Go back"
          >
            <BackIcon size={20} />
          </button>
          <span className="font-serif font-bold text-sm text-slate-900">Official Announcement</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
            title="Close"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-14 left-4 right-4 bg-emerald-900 text-white text-xs px-4 py-2.5 rounded-xl text-center shadow-lg z-30 animate-fade-in">
            {toastMessage}
          </div>
        )}

        {/* Content Scroll Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading || !post ? (
            <div className="space-y-4 p-4 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-40 bg-slate-200 rounded-2xl"></div>
              <div className="h-20 bg-slate-200 rounded-xl"></div>
            </div>
          ) : (
            <>
              {/* Author Info Header */}
              <div 
                onClick={() => onOpenProfile(post.author.id)}
                className="flex items-center space-x-3 cursor-pointer group bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm"
              >
                <img
                  src={post.author.profileImage}
                  alt={post.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-emerald-500/40"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {post.author.name}
                    </span>
                    {post.author.isVerified && (
                      <CheckCircle2 size={16} className="text-emerald-600 fill-emerald-100 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    {post.author.designation} · {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Title & Body */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <h2 className="font-serif-title text-xl font-bold text-slate-900 leading-snug">
                  {post.title}
                </h2>
                <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                  {post.content}
                </div>

                {/* Media Image/Video */}
                {post.mediaUrl && (
                  <div className="mt-3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                    {post.mediaType === 'video' ? (
                      <video src={post.mediaUrl} controls className="w-full h-auto" />
                    ) : post.mediaType === 'youtube' ? (
                      <div className="relative w-full aspect-video bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYouTubeId(post.youtubeUrl || post.mediaUrl)}?autoplay=0&rel=0`}
                          title={post.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <img src={post.mediaUrl} alt={post.title} className="w-full h-auto object-cover" />
                    )}
                  </div>
                )}

                {/* PDF Attachment */}
                {post.attachmentUrl && (
                  <a
                    href={post.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-800 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <AttachmentIcon size={16} className="text-emerald-600 shrink-0" />
                      <span className="font-semibold truncate">Official Department Document (PDF)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">Download</span>
                  </a>
                )}

                {/* Like & Share Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <button
                    onClick={handleLikePost}
                    className={`flex items-center space-x-2 py-1.5 px-3 rounded-full transition-colors ${
                      post.isLikedByMe ? 'text-rose-600 bg-rose-50 font-semibold' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <LikeIcon size={16} liked={post.isLikedByMe} />
                    <span>{post.likesCount} Likes</span>
                  </button>

                  <div className="flex items-center space-x-2 text-slate-500">
                    <CommentIcon size={16} />
                    <span>{post.commentsCount} Comments</span>
                  </div>
                </div>
              </div>

              {/* Comments Section Header */}
              <div className="pt-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Community Discussion ({comments.length})
                </h4>

                {!post.commentsEnabled && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl mb-3">
                    Comments have been disabled for this official notice by the HOD Office.
                  </div>
                )}

                {/* Comment List Tree */}
                <div className="space-y-2.5">
                  {comments.map((cmt) => (
                    <div key={cmt.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <img src={cmt.user.profileImage} alt={cmt.user.name} className="w-7 h-7 rounded-full object-cover" />
                          <div>
                            <div className="flex items-center space-x-1">
                              <span className="font-semibold text-xs text-slate-900">{cmt.user.name}</span>
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                {cmt.user.role}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setReportingCommentId(cmt.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Report comment"
                        >
                          <Flag size={13} />
                        </button>
                      </div>

                      <p className="text-xs text-slate-700 leading-normal pl-9">
                        {cmt.content}
                      </p>

                      <div className="flex items-center space-x-4 pl-9 text-[11px] text-slate-500 pt-1">
                        <button
                          onClick={() => handleLikeComment(cmt.id, cmt.isLikedByMe)}
                          className={`flex items-center space-x-1 ${cmt.isLikedByMe ? 'text-rose-600 font-bold' : 'hover:text-slate-800'}`}
                        >
                          <LikeIcon size={13} liked={cmt.isLikedByMe} />
                          <span>{cmt.likesCount}</span>
                        </button>

                        {post.commentsEnabled && (
                          <button
                            onClick={() => setReplyingTo(cmt)}
                            className="hover:text-emerald-700 font-medium flex items-center space-x-1"
                          >
                            <CornerDownRight size={12} />
                            <span>Reply</span>
                          </button>
                        )}
                      </div>

                      {/* Nested Replies */}
                      {cmt.replies && cmt.replies.length > 0 && (
                        <div className="ml-6 pl-3 border-l-2 border-slate-100 space-y-2 pt-2">
                          {cmt.replies.map((reply) => (
                            <div key={reply.id} className="bg-slate-50 p-2.5 rounded-xl text-xs space-y-1">
                              <div className="flex items-center space-x-1.5">
                                <img src={reply.user.profileImage} alt={reply.user.name} className="w-5 h-5 rounded-full object-cover" />
                                <span className="font-semibold text-slate-900">{reply.user.name}</span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-white text-slate-500 border border-slate-200">
                                  {reply.user.role}
                                </span>
                              </div>
                              <p className="text-slate-700 pl-6">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Fixed Comment Input Drawer */}
        {post && post.commentsEnabled && (
          <form onSubmit={handleAddComment} className="bg-white border-t border-slate-200 p-3 sticky bottom-0 z-20">
            {replyingTo && (
              <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg mb-2 border border-emerald-200">
                <span>Replying to <strong>{replyingTo.user.name}</strong></span>
                <button type="button" onClick={() => setReplyingTo(null)} className="text-emerald-900 font-bold">✕</button>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder={replyingTo ? `Write a reply...` : "Write a comment..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 bg-slate-100 border border-slate-200 text-xs text-slate-900 rounded-full px-4 py-2.5 outline-none focus:border-emerald-600 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
              >
                <ForwardIcon size={15} />
              </button>
            </div>
          </form>
        )}

        {/* Report Modal */}
        {reportingCommentId && (
          <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl space-y-3">
              <div className="flex items-center space-x-2 text-rose-600 font-bold text-sm">
                <AlertTriangle size={18} />
                <span>Report Comment</span>
              </div>
              <p className="text-xs text-slate-500">
                Select reason for reporting this comment to HOD Moderation Desk:
              </p>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-slate-100 border border-slate-300 text-xs rounded-xl p-2.5 outline-none font-medium"
              >
                <option value="Spam">Spam / Unsolicited</option>
                <option value="Harassment">Harassment or Bullying</option>
                <option value="Offensive content">Offensive Language</option>
                <option value="Inappropriate content">Inappropriate / Off-Topic</option>
                <option value="Other">Other Violation</option>
              </select>
              <div className="flex justify-end space-x-2 pt-2">
                <button onClick={() => setReportingCommentId(null)} className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-xl">Cancel</button>
                <button onClick={handleReportCommentSubmit} className="px-3 py-1.5 text-xs text-white bg-rose-600 rounded-xl font-bold">Submit Report</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
