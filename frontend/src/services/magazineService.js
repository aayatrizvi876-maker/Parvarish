/**
 * PARVARISH MAGAZINE SERVICE (Exhibition Photography Gallery)
 * 
 * Manages the university archival digital magazine photo gallery.
 * All photographs displayed are published and curated exclusively by Department Admins.
 * 
 * -------------------------------------------------------------
 * FUTURE SUPABASE INTEGRATION SCHEMA:
 * -------------------------------------------------------------
 * create table public.magazine_photos (
 *   id uuid primary key default gen_random_uuid(),
 *   title text,
 *   caption text,
 *   image_url text not null,
 *   category text default 'Architecture & Heritage',
 *   location text,
 *   year text default '2026',
 *   curator text default 'Department Archival Committee',
 *   published_by text default 'ADMIN',
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- Supabase Row Level Security (RLS) Policy:
 * -- Everyone (including students and anonymous visitors) has SELECT access.
 * -- Only users with auth.jwt() ->> 'role' = 'ADMIN' have INSERT, UPDATE, DELETE permissions.
 * -------------------------------------------------------------
 */

const STORAGE_KEY = 'parvarish_magazine_gallery_v1';

// Initial curated university exhibition photographs (All published by ADMIN)
const INITIAL_CURATED_PHOTOS = [
  {
    id: 'mag_photo_01',
    title: 'The Great Quadrangle at Dawn',
    caption: 'Centennial cloister arches and sandstone colonnades enveloped in gentle morning autumnal fog.',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85',
    category: 'Architecture & Heritage',
    location: 'North Quadrangle Colonnade',
    year: '2026',
    curator: 'Department Archival Committee',
    publishedBy: 'ADMIN',
    publishedAt: '2026-10-18T08:30:00Z'
  },
  {
    id: 'mag_photo_02',
    title: 'Centennial Convocation Procession',
    caption: 'Faculty senate and graduating scholars assembled in ceremonial academic robes at Founder’s Hall.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85',
    category: 'Convocation & Gala',
    location: 'Senate Assembly Hall',
    year: '2026',
    curator: 'Dean of Academic Affairs',
    publishedBy: 'ADMIN',
    publishedAt: '2026-10-14T11:00:00Z'
  },
  {
    id: 'mag_photo_03',
    title: 'The Rare Manuscripts Reading Room',
    caption: 'Historic oak-paneled sanctuary housing 18th-century classical treatises and departmental archives.',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1600&q=85',
    category: 'Architecture & Heritage',
    location: 'Central Memorial Library',
    year: '2026',
    curator: 'Department Archival Committee',
    publishedBy: 'ADMIN',
    publishedAt: '2026-10-10T14:15:00Z'
  },
  {
    id: 'mag_photo_04',
    title: 'Autumnal Ginkgo Walkway',
    caption: 'Students walking beneath the golden foliage canopy linking the Science Quad to the Arts Faculty.',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=85',
    category: 'Campus Life',
    location: 'South Promenade Gardens',
    year: '2026',
    curator: 'Department Media Council',
    publishedBy: 'ADMIN',
    publishedAt: '2026-10-06T16:45:00Z'
  },
  {
    id: 'mag_photo_05',
    title: 'Advanced Spectroscopy Research Bench',
    caption: 'Graduate fellows calibrating high-precision laser optics in the Photonics & Materials Annex.',
    imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=85',
    category: 'Research & Science',
    location: 'Sir C.V. Raman Laboratory',
    year: '2026',
    curator: 'Department Archival Committee',
    publishedBy: 'ADMIN',
    publishedAt: '2026-09-28T10:20:00Z'
  },
  {
    id: 'mag_photo_06',
    title: 'Department Philharmonic Gala',
    caption: 'The university orchestra in mid-crescendo during the Annual Autumn Symphonic Concert.',
    imageUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1600&q=85',
    category: 'Fine Arts & Culture',
    location: 'Tagore Grand Auditorium',
    year: '2026',
    curator: 'Cultural Affairs Committee',
    publishedBy: 'ADMIN',
    publishedAt: '2026-09-20T19:30:00Z'
  },
  {
    id: 'mag_photo_07',
    title: 'The Campanile at Twilight',
    caption: 'The historic clocktower silhouetted against an indigo dusk, chiming the evening quarter-tones.',
    imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=85',
    category: 'Architecture & Heritage',
    location: 'Victoria Memorial Tower',
    year: '2026',
    curator: 'Department Archival Committee',
    publishedBy: 'ADMIN',
    publishedAt: '2026-09-15T18:50:00Z'
  },
  {
    id: 'mag_photo_08',
    title: 'Distinguished Faculty Laurels',
    caption: 'Honoring senior professors for four decades of foundational contributions to research pedagogy.',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=85',
    category: 'Convocation & Gala',
    location: 'Convocation Center',
    year: '2026',
    curator: 'Dean of Academic Affairs',
    publishedBy: 'ADMIN',
    publishedAt: '2026-09-08T15:00:00Z'
  }
];

class MagazineService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CURATED_PHOTOS));
    }
  }

  getAllStoredPhotos() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : INITIAL_CURATED_PHOTOS;
    } catch {
      return INITIAL_CURATED_PHOTOS;
    }
  }

  saveAllPhotos(photos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
  }

  // Returns ONLY photos published by ADMIN
  async getPhotos({ category = 'All', search = '' } = {}) {
    await new Promise(r => setTimeout(r, 60)); // Micro delay for smooth UI feel
    const all = this.getAllStoredPhotos();

    // Strict filter: Only admin-published photographs appear in the magazine gallery
    let filtered = all.filter(p => p.publishedBy === 'ADMIN');

    if (category && category !== 'All') {
      filtered = filtered.filter(p => p.category === category);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q))
      );
    }

    return filtered;
  }

  // Add new photo (Admin only)
  async addPhoto(newPhotoData) {
    const all = this.getAllStoredPhotos();
    const newEntry = {
      id: `mag_photo_${Date.now()}`,
      title: newPhotoData.title?.trim() || 'Untitled Archival Study',
      caption: newPhotoData.caption?.trim() || '',
      imageUrl: newPhotoData.imageUrl?.trim(),
      category: newPhotoData.category || 'Architecture & Heritage',
      location: newPhotoData.location?.trim() || 'University Campus',
      year: newPhotoData.year || new Date().getFullYear().toString(),
      curator: newPhotoData.curator || 'Department Archival Committee',
      publishedBy: 'ADMIN', // Strictly ADMIN
      publishedAt: new Date().toISOString()
    };

    all.unshift(newEntry);
    this.saveAllPhotos(all);
    return newEntry;
  }

  // Update photo (Admin only)
  async updatePhoto(id, updates) {
    const all = this.getAllStoredPhotos();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Photograph not found');

    all[idx] = {
      ...all[idx],
      ...updates,
      publishedBy: 'ADMIN' // Always preserved
    };

    this.saveAllPhotos(all);
    return all[idx];
  }

  // Delete photo (Admin only)
  async deletePhoto(id) {
    let all = this.getAllStoredPhotos();
    all = all.filter(p => p.id !== id);
    this.saveAllPhotos(all);
    return true;
  }

  // Categories list
  getCategories() {
    return [
      'All',
      'Architecture & Heritage',
      'Convocation & Gala',
      'Campus Life',
      'Fine Arts & Culture',
      'Research & Science'
    ];
  }

  // Reset to initial collection if needed
  resetToDefault() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CURATED_PHOTOS));
    return INITIAL_CURATED_PHOTOS;
  }
}

export const magazineService = new MagazineService();
