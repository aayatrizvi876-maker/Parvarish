import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileText, Pin, Trash2, Edit3, MessageSquare, CheckCircle2 } from 'lucide-react';

export function AdminPostManageView({ onOpenPost }) {
  const [statusTab, setStatusTab] = useState('PUBLISHED');
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminPosts = async () => {
    try {
      setIsLoading(true);
      const res = await api.getPosts({ status: statusTab, limit: 100 });
      setPosts(res.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminPosts();
  }, [statusTab]);

  const handleTogglePin = async (post) => {
    try {
      await api.updatePost(post.id, { isPinned: !post.isPinned });
      fetchAdminPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this official post?')) return;
    try {
      await api.deletePost(postId);
      fetchAdminPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 bg-slate-100 min-h-screen p-4 pb-16 animate-fade-in space-y-4">
      <div className="flex items-center space-x-2">
        <FileText size={22} className="text-emerald-700" />
        <h2 className="font-serif-title text-xl font-bold text-slate-900">Manage Official Publications</h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 border border-slate-200 text-xs font-semibold">
        {['PUBLISHED', 'DRAFT', 'SCHEDULED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusTab(s)}
            className={`flex-1 py-2 rounded-lg text-center transition-all ${
              statusTab === s ? 'bg-slate-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading publications...</div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 text-xs">
            No posts found under status {statusTab}.
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                  {post.categoryId}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              </div>

              <h3 
                onClick={() => onOpenPost(post.id)}
                className="font-serif-title font-bold text-sm text-slate-900 hover:text-emerald-700 cursor-pointer line-clamp-1"
              >
                {post.title}
              </h3>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center space-x-3">
                  <span>❤️ {post.likesCount}</span>
                  <span>💬 {post.commentsCount}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePin(post)}
                    className={`p-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 ${
                      post.isPinned ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Pin size={12} className="rotate-45" />
                    <span>{post.isPinned ? 'Unpin' : 'Pin'}</span>
                  </button>

                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100"
                    title="Delete Post"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
