import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ExploreIcon, 
  DepartmentIcon, 
  UniversityIcon, 
  FollowIcon 
} from '../components/icons/ParvarishIcons';
import { Users, Building, Award, Sparkles, Filter, ChevronRight } from 'lucide-react';

export function ExploreView({ onOpenPost }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchTab, setActiveSearchTab] = useState('posts'); // 'posts', 'people', 'clubs', 'departments'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { id: 'research', name: 'Research & Papers', icon: '🔬', color: 'bg-blue-50 text-blue-900 border-blue-200' },
    { id: 'photography', name: 'Photography', icon: '📸', color: 'bg-emerald-50 text-emerald-900 border-emerald-200' },
    { id: 'poetry', name: 'Poetry & Literature', icon: '📜', color: 'bg-amber-50 text-amber-900 border-amber-200' },
    { id: 'innovation', name: 'Innovation & Startups', icon: '🚀', color: 'bg-purple-50 text-purple-900 border-purple-200' },
    { id: 'campus_life', name: 'Campus Life', icon: '🏛️', color: 'bg-rose-50 text-rose-900 border-rose-200' },
    { id: 'art', name: 'Artwork & Design', icon: '🎨', color: 'bg-indigo-50 text-indigo-900 border-indigo-200' },
    { id: 'creative_writing', name: 'Creative Writing', icon: '✍️', color: 'bg-teal-50 text-teal-900 border-teal-200' },
    { id: 'achievements', name: 'Achievements', icon: '🏆', color: 'bg-yellow-50 text-yellow-900 border-yellow-200' },
    { id: 'books', name: 'Book Recommendations', icon: '📚', color: 'bg-[#FAF8F5] text-slate-900 border-amber-300' },
    { id: 'faculty', name: 'Faculty Corner', icon: '👨‍🏫', color: 'bg-blue-100/60 text-blue-950 border-blue-300' },
    { id: 'students', name: 'Student Spotlight', icon: '🎓', color: 'bg-amber-100/60 text-amber-950 border-amber-300' },
    { id: 'departments', name: 'Departments', icon: '🏢', color: 'bg-slate-100 text-slate-900 border-slate-300' },
    { id: 'clubs', name: 'Clubs & Societies', icon: '👥', color: 'bg-cyan-50 text-cyan-900 border-cyan-200' },
    { id: 'alumni', name: 'Alumni Stories', icon: '🌟', color: 'bg-orange-50 text-orange-900 border-orange-200' }
  ];

  const peopleList = [
    { name: 'Prof. Dr. Anand Kumar Gupta', role: 'Head of Department', dept: 'CSE', type: 'Faculty' },
    { name: 'Dr. Meera Verma', role: 'Associate Professor', dept: 'AI & ML Chair', type: 'Faculty' },
    { name: 'Aarav Mehta', role: 'Final Year Lead', dept: 'Hackathon Champion', type: 'Student' },
    { name: 'Ananya Roy', role: 'Anita Borg Scholar', dept: 'IEEE Lead', type: 'Student' },
    { name: 'Prof. Rajesh Gupta', role: 'Assistant Professor', dept: 'Systems & Cloud', type: 'Faculty' }
  ];

  const clubsList = [
    { name: 'Coding & Algorithmic Society', count: '450 Members', desc: 'Competitive programming and open-source development.' },
    { name: 'IEEE Student Branch', count: '320 Members', desc: 'Research papers, workshops, and international symposia.' },
    { name: 'AI & Robotics Club', count: '280 Members', desc: 'Autonomous bots, computer vision, and machine learning.' },
    { name: 'Literary & Arts Circle', count: '210 Members', desc: 'Creative writing, poetry, and magazine publishing.' }
  ];

  const departmentsList = [
    { name: 'Computer Science & Engineering', head: 'Prof. Dr. A. K. Gupta', code: 'CSE' },
    { name: 'Artificial Intelligence & Data Science', head: 'Dr. Meera Verma', code: 'AI-DS' },
    { name: 'Information Technology', head: 'Dr. S. K. Roy', code: 'IT' }
  ];

  useEffect(() => {
    async function doSearch() {
      setIsLoading(true);
      try {
        const res = await api.getPosts({
          category: selectedCategory || '',
          search: searchQuery
        });
        setResults(res.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    doSearch();
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex-1 bg-[#FAF8F5] min-h-screen p-4 pb-20 font-sans">
      {/* Header */}
      <div className="flex items-center space-x-2.5 mb-4">
        <ExploreIcon size={24} selected={true} className="text-[#1E3A8A]" />
        <div>
          <h2 className="font-serif text-xl font-bold text-[#1E3A8A]">Explore Parvarish</h2>
          <p className="text-[11px] text-slate-500">Discover stories, research, people, and university culture</p>
        </div>
      </div>

      {/* Global Search Field */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search posts, articles, people, clubs, departments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-amber-900/15 text-xs text-slate-900 rounded-2xl py-3 pl-10 pr-4 outline-none focus:border-[#1E3A8A] shadow-xs"
        />
        <ExploreIcon size={16} selected={false} className="absolute left-3.5 top-3.5 text-slate-400" />
      </div>

      {/* Search Filter Tabs */}
      <div className="flex border-b border-amber-900/10 mb-4 text-xs font-semibold text-slate-600">
        {[
          { id: 'posts', label: 'Publications' },
          { id: 'people', label: 'People' },
          { id: 'clubs', label: 'Clubs' },
          { id: 'departments', label: 'Departments' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSearchTab(tab.id)}
            className={`pb-2.5 px-3 transition-colors relative ${
              activeSearchTab === tab.id ? 'text-[#1E3A8A] font-bold' : 'hover:text-slate-900'
            }`}
          >
            {tab.label}
            {activeSearchTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A] rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* 14 Categories Grid (Shown when searching posts) */}
      {activeSearchTab === 'posts' && (
        <>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif font-bold text-slate-900 text-sm">Categories & Topics</h3>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-[11px] text-[#1E3A8A] font-bold underline"
              >
                Clear Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 shadow-2xs ${cat.color} ${
                  selectedCategory === cat.id ? 'ring-2 ring-[#1E3A8A] scale-[1.02]' : 'hover:shadow-xs'
                }`}
              >
                <span className="text-xl shrink-0">{cat.icon}</span>
                <span className="text-xs font-bold leading-tight font-serif truncate">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-slate-900 text-sm">
                {selectedCategory ? `Results for "${selectedCategory}"` : 'Recent Highlights'}
              </h4>
              <span className="text-[11px] text-slate-500">{results.length} posts</span>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500 font-serif italic">Searching repository...</div>
            ) : results.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-amber-900/10 text-slate-500 text-xs">
                No publications found matching your selection.
              </div>
            ) : (
              results.map((post) => (
                <div
                  key={post.id}
                  onClick={() => onOpenPost(post.id)}
                  className="bg-white p-4 rounded-2xl border border-amber-900/10 shadow-xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold mb-1">
                    <span className="uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 font-serif">
                      {post.subCategory || post.categoryId}
                    </span>
                    <span>{new Date(post.publishedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-[#1E3A8A] transition-colors line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* People Tab */}
      {activeSearchTab === 'people' && (
        <div className="space-y-3">
          {peopleList.map((p, i) => (
            <div key={i} className="bg-white p-3.5 rounded-2xl border border-amber-900/10 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs font-serif">
                  {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-slate-900">{p.name}</h4>
                  <p className="text-[11px] text-slate-500">{p.role} • {p.dept}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                {p.type}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Clubs Tab */}
      {activeSearchTab === 'clubs' && (
        <div className="space-y-3">
          {clubsList.map((c, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-amber-900/10 shadow-xs">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-serif font-bold text-sm text-[#1E3A8A]">{c.name}</h4>
                <span className="text-[10px] bg-blue-50 text-blue-900 px-2 py-0.5 rounded-full font-semibold">{c.count}</span>
              </div>
              <p className="text-xs text-slate-600">{c.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Departments Tab */}
      {activeSearchTab === 'departments' && (
        <div className="space-y-3">
          {departmentsList.map((d, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-amber-900/10 shadow-xs flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">{d.code}</span>
                <h4 className="font-serif font-bold text-sm text-slate-900 mt-1">{d.name}</h4>
                <p className="text-[11px] text-slate-500">Head: {d.head}</p>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
