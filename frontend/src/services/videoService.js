/**
 * Parvarish Video Service (YouTube Integration & Supabase-Ready Store)
 * 
 * DESIGNED FOR SUPABASE MIGRATION:
 * This service currently stores and mutates videos using browser LocalStorage
 * and mock data. All schema properties match the planned Supabase "videos" table:
 * 
 * CREATE TABLE videos (
 *   id TEXT PRIMARY KEY,
 *   title TEXT NOT NULL,
 *   description TEXT,
 *   youtube_url TEXT NOT NULL,
 *   video_id TEXT NOT NULL,
 *   thumbnail_url TEXT,
 *   channel_title TEXT,
 *   category TEXT NOT NULL,
 *   duration TEXT,
 *   views_count INTEGER DEFAULT 0,
 *   likes_count INTEGER DEFAULT 0,
 *   published_at TIMESTAMPTZ DEFAULT NOW(),
 *   created_by TEXT REFERENCES auth.users(id),
 *   status TEXT DEFAULT 'PUBLISHED'
 * );
 */

const STORAGE_KEY = 'parvarish_youtube_videos_v1';

// Initial Curated Campus & Academic Videos (Realistic Mock Data)
const INITIAL_VIDEOS = [
  {
    id: 'vid_001',
    title: 'Parvarish University Heritage Walk & Campus Tour 2026',
    description: 'Experience the historic red-brick cloisters, central library, high-performance computing labs, and lively student lawns in this official cinematic tour.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
    channelTitle: 'Parvarish University Official',
    category: 'Campus Life',
    duration: '08:45',
    viewsCount: 3420,
    likesCount: 284,
    publishedAt: '2026-10-18T10:00:00Z',
    createdBy: 'usr_hod_official_001',
    authorName: 'Office of Dean & Administration',
    isFeatured: true
  },
  {
    id: 'vid_002',
    title: 'Next-Gen Quantum Computing & AI Keynote by Dr. Meera Verma',
    description: 'Departmental Symposium on algorithmic complexity in post-quantum cryptography and neural networks, presented at the Parvarish Science Auditorium.',
    youtubeUrl: 'https://www.youtube.com/watch?v=k3_tw44QsZQ',
    videoId: 'k3_tw44QsZQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    channelTitle: 'CSE & AI Department',
    category: 'Research & Tech',
    duration: '34:12',
    viewsCount: 1890,
    likesCount: 195,
    publishedAt: '2026-10-20T14:30:00Z',
    createdBy: 'usr_hod_official_001',
    authorName: 'Prof. Dr. Anand Kumar Gupta',
    isFeatured: true
  },
  {
    id: 'vid_003',
    title: 'Annual TechFest "InnovateX 2026" Grand Finale & Hackathon Highlights',
    description: '36 hours of non-stop code, hardware robotics, and venture pitches. Watch the winning teams showcase their AI assistive solutions.',
    youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
    videoId: '9bZkp7q19f0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    channelTitle: 'InnovateX Student Committee',
    category: 'Student Spotlight',
    duration: '05:20',
    viewsCount: 4210,
    likesCount: 512,
    publishedAt: '2026-10-22T16:00:00Z',
    createdBy: 'usr_hod_official_001',
    authorName: 'Student Affairs Council',
    isFeatured: false
  },
  {
    id: 'vid_004',
    title: 'Department Guidelines: Mid-Semester Evaluation & Research Thesis Submissions',
    description: 'Official briefing by HOD Prof. Dr. Anand Kumar Gupta regarding formatting requirements, anti-plagiarism checks, and oral defence schedules.',
    youtubeUrl: 'https://youtu.be/3JZ_D3ELwOQ',
    videoId: '3JZ_D3ELwOQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
    channelTitle: 'HOD Academic Desk',
    category: 'Announcements',
    duration: '14:30',
    viewsCount: 5630,
    likesCount: 420,
    publishedAt: '2026-10-23T09:15:00Z',
    createdBy: 'usr_hod_official_001',
    authorName: 'HOD Official Publishing Desk',
    isFeatured: false
  },
  {
    id: 'vid_005',
    title: 'Music Society Acoustic Evening: Sufi & Classical Melodies at Sunset',
    description: 'An unplugged cultural evening under the central banyan tree, hosted by the Parvarish Cultural & Literary Society.',
    youtubeUrl: 'https://www.youtube.com/shorts/kJQP7kiw5Fk',
    videoId: 'kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    channelTitle: 'Parvarish Cultural Society',
    category: 'Cultural & Arts',
    duration: '03:15',
    viewsCount: 2890,
    likesCount: 340,
    publishedAt: '2026-10-24T18:00:00Z',
    createdBy: 'usr_hod_official_001',
    authorName: 'Cultural Secretary',
    isFeatured: false
  }
];

/**
 * Robust YouTube URL Parser
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID&feature=...
 * - https://youtu.be/VIDEO_ID?si=...
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern 1: youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  // Pattern 2: youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  // Pattern 3: youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  // Pattern 4: youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  // Pattern 5: Naked 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Returns the highest resolution YouTube thumbnail URL for a given video ID.
 */
export function getYouTubeThumbnail(videoId, quality = 'hq') {
  if (!videoId) return 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80';
  if (quality === 'max') return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  if (quality === 'mq') return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Fetch video metadata via public oEmbed endpoint.
 * Works without API keys and without CORS proxies.
 */
export async function fetchYouTubeMetadata(rawUrl) {
  const videoId = extractYouTubeId(rawUrl);
  if (!videoId) {
    throw new Error('Please enter a valid YouTube video or Shorts URL.');
  }

  const standardUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const defaultMeta = {
    videoId,
    title: '',
    channelTitle: 'Parvarish University Channel',
    thumbnailUrl: getYouTubeThumbnail(videoId, 'hq'),
    youtubeUrl: standardUrl
  };

  try {
    // Attempt noembed / youtube oembed
    const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(standardUrl)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(oembedUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return {
        videoId,
        title: data.title || '',
        channelTitle: data.author_name || 'Parvarish University Channel',
        thumbnailUrl: data.thumbnail_url || getYouTubeThumbnail(videoId, 'hq'),
        youtubeUrl: standardUrl
      };
    }
  } catch (err) {
    console.warn('oEmbed fetch timed out or offline, using fallback metadata:', err);
  }

  return defaultMeta;
}

/**
 * Local Storage Operations (Mirrors future Supabase table)
 */
function loadStoredVideos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VIDEOS));
      return INITIAL_VIDEOS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_VIDEOS;
  } catch (e) {
    console.error('Failed to load videos from storage:', e);
    return INITIAL_VIDEOS;
  }
}

function saveStoredVideos(videos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
  } catch (e) {
    console.error('Failed to save videos to storage:', e);
  }
}

/**
 * Video API Interface (Mock + Supabase Ready)
 */
export const videoService = {
  // Read all videos with optional category and search filters
  async getVideos({ category = 'All', search = '' } = {}) {
    const all = loadStoredVideos();
    return all.filter(v => {
      const matchesCategory = category === 'All' || v.category.toLowerCase() === category.toLowerCase();
      const matchesSearch = !search || 
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        v.description.toLowerCase().includes(search.toLowerCase()) ||
        (v.channelTitle && v.channelTitle.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  },

  // Read single video by ID
  async getVideoById(id) {
    const all = loadStoredVideos();
    return all.find(v => v.id === id) || null;
  },

  // Admin Create Video
  async createVideo(videoPayload, currentUser) {
    const videoId = extractYouTubeId(videoPayload.youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL provided.');
    }

    const newVideo = {
      id: `vid_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: videoPayload.title.trim() || 'Untitled Campus Video',
      description: videoPayload.description ? videoPayload.description.trim() : '',
      youtubeUrl: videoPayload.youtubeUrl.trim(),
      videoId: videoId,
      thumbnailUrl: videoPayload.thumbnailUrl || getYouTubeThumbnail(videoId, 'hq'),
      channelTitle: videoPayload.channelTitle?.trim() || 'Parvarish University Channel',
      category: videoPayload.category || 'Campus Life',
      duration: videoPayload.duration || '05:00',
      viewsCount: 1,
      likesCount: 0,
      publishedAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'usr_hod_official_001',
      authorName: currentUser?.name || 'Head of Department',
      isFeatured: Boolean(videoPayload.isFeatured)
    };

    const all = loadStoredVideos();
    const updated = [newVideo, ...all];
    saveStoredVideos(updated);
    return newVideo;
  },

  // Admin Update Video
  async updateVideo(id, updates) {
    const all = loadStoredVideos();
    const idx = all.findIndex(v => v.id === id);
    if (idx === -1) throw new Error('Video not found.');

    let videoId = all[idx].videoId;
    if (updates.youtubeUrl && updates.youtubeUrl !== all[idx].youtubeUrl) {
      const extracted = extractYouTubeId(updates.youtubeUrl);
      if (extracted) videoId = extracted;
    }

    all[idx] = {
      ...all[idx],
      ...updates,
      videoId,
      thumbnailUrl: updates.thumbnailUrl || getYouTubeThumbnail(videoId, 'hq'),
      updatedAt: new Date().toISOString()
    };

    saveStoredVideos(all);
    return all[idx];
  },

  // Admin Delete Video
  async deleteVideo(id) {
    const all = loadStoredVideos();
    const filtered = all.filter(v => v.id !== id);
    saveStoredVideos(filtered);
    return { success: true, id };
  },

  // Interactive Like Counter
  async toggleLikeVideo(id) {
    const all = loadStoredVideos();
    const video = all.find(v => v.id === id);
    if (video) {
      const likedKey = `parvarish_liked_vid_${id}`;
      const isLiked = localStorage.getItem(likedKey) === 'true';
      if (isLiked) {
        video.likesCount = Math.max(0, (video.likesCount || 0) - 1);
        localStorage.removeItem(likedKey);
      } else {
        video.likesCount = (video.likesCount || 0) + 1;
        localStorage.setItem(likedKey, 'true');
      }
      saveStoredVideos(all);
      return { liked: !isLiked, likesCount: video.likesCount };
    }
    return { liked: false, likesCount: 0 };
  },

  isLiked(id) {
    return localStorage.getItem(`parvarish_liked_vid_${id}`) === 'true';
  },

  // Reset to initial mock database (useful for testing)
  resetDemoDatabase() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_VIDEOS));
    return INITIAL_VIDEOS;
  }
};
