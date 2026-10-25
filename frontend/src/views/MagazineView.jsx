import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MagazineIcon, AddIcon, EditIcon, DeleteIcon, RefreshIcon } from '../components/icons/ParvarishIcons';
import { magazineService } from '../services/magazineService';
import { MagazineImageViewer } from '../components/magazine/MagazineImageViewer';
import { AdminPhotoModal } from '../components/magazine/AdminPhotoModal';
import { Camera, Shield, MapPin, Calendar, Sparkles, SlidersHorizontal } from 'lucide-react';

export function MagazineView() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [photos, setPhotos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Lightbox / Image Viewer state
  const [viewerIndex, setViewerIndex] = useState(null);

  // Admin Curator modal state
  const [isCuratorModalOpen, setIsCuratorModalOpen] = useState(false);
  const [photoToEdit, setPhotoToEdit] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const categories = magazineService.getCategories();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      const data = await magazineService.getPhotos({
        category: selectedCategory
      });
      setPhotos(data);
    } catch (err) {
      console.error('Failed to load exhibition photos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [selectedCategory]);

  const handleDeletePhoto = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this photograph from the exhibition archive?')) {
      try {
        await magazineService.deletePhoto(id);
        showToast('Photograph removed from exhibition.');
        loadPhotos();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEditPhoto = (photo, e) => {
    e.stopPropagation();
    setPhotoToEdit(photo);
    setIsCuratorModalOpen(true);
  };

  const handleSaved = () => {
    showToast(photoToEdit ? 'Photograph updated successfully.' : 'New photograph cataloged in exhibition.');
    setPhotoToEdit(null);
    loadPhotos();
  };

  return (
    <div className="flex-1 bg-[#FAF8F5] min-h-screen pb-24 font-sans select-none">
      
      {/* Top Exhibition Gallery Header Banner */}
      <div className="bg-[#091734] text-white pt-7 pb-8 px-5 lg:px-10 border-b border-[#15274d] relative overflow-hidden shadow-md">
        {/* Ambient Golden Exhibition Illumination */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5A880]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-[#C5A880] text-xs font-serif italic mb-1.5">
                <Camera size={14} className="text-amber-300" />
                <span>The Official University Photographic Chronicle & Archival Exhibition</span>
              </div>
              <h1 className="font-serif text-2xl lg:text-3xl font-bold text-[#FFF4DC] tracking-wide flex items-center gap-2.5">
                <MagazineIcon size={26} selected={true} spineColor="#091734" className="text-[#FFF4DC]" />
                <span>PARVARISH MAGAZINE</span>
              </h1>
              <p className="text-xs text-slate-300 font-serif max-w-xl mt-1.5 leading-relaxed">
                A curated visual chronicle showcasing campus heritage, academic galas, architectural milestones, and collegiate moments.
              </p>
            </div>

            {/* Header Right: Edition Badge & Admin Curator Controls */}
            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
              <div className="bg-[#C5A880]/15 text-[#FFF4DC] border border-[#C5A880]/30 px-3.5 py-1.5 rounded-full text-xs font-serif tracking-wider">
                Annual Visual Chronicle • 2026
              </div>

              {/* Admin Only Curator Button */}
              {isAdmin && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 bg-amber-400/20 text-amber-200 px-3 py-1.5 rounded-full border border-amber-300/30 text-xs font-semibold">
                    <Shield size={12} className="text-amber-300" />
                    <span>Curator Mode</span>
                  </div>

                  <button
                    onClick={() => {
                      setPhotoToEdit(null);
                      setIsCuratorModalOpen(true);
                    }}
                    className="bg-[#FFF4DC] hover:bg-[#F6EEDB] text-[#091734] font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center space-x-1.5 border border-amber-300"
                  >
                    <AddIcon size={16} />
                    <span>Curate Photo</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Subtle Category Filter Pills */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] uppercase tracking-wider text-[#C5A880] font-serif font-semibold mr-1 shrink-0 flex items-center gap-1">
              <SlidersHorizontal size={12} />
              <span>Galleries:</span>
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#FFF4DC] text-[#091734] font-bold shadow-sm'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {cat === 'All' ? 'All Collections' : cat}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#091734] text-[#FFF4DC] text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center space-x-2 animate-bounce border border-amber-300/30">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Exhibition Gallery Content */}
      <main className="max-w-6xl mx-auto px-5 lg:px-10 py-7 space-y-6">
        
        {/* Exhibition Header Counter & Curation Stamp */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-900/10">
          <div>
            <h2 className="font-serif font-bold text-lg text-[#091734]">
              {selectedCategory === 'All' ? 'Archival Gallery Collection' : `${selectedCategory} Collection`}
            </h2>
            <p className="text-xs text-slate-500 font-serif mt-0.5">
              Click any photograph to enter the full-screen exhibition viewer.
            </p>
          </div>
          <span className="text-xs font-serif text-slate-600 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">
            {photos.length} {photos.length === 1 ? 'Photograph' : 'Photographs'} Exhibited
          </span>
        </div>

        {/* Loading Skeletons */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-slate-200 space-y-3">
                <div className="w-full h-56 bg-slate-200 rounded-2xl"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : photos.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-amber-900/10 p-12 text-center my-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto mb-3.5 border border-amber-200/60">
              <Camera size={30} />
            </div>
            <h3 className="font-serif font-bold text-slate-900 text-base">
              Exhibition Archive Empty
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 font-serif max-w-sm mx-auto leading-relaxed">
              {selectedCategory !== 'All' 
                ? `There are no photographs cataloged under "${selectedCategory}" yet.`
                : 'There are no photographs in the university exhibition gallery at this time.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => {
                  setPhotoToEdit(null);
                  setIsCuratorModalOpen(true);
                }}
                className="mt-5 bg-[#091734] text-[#FFF4DC] text-xs font-bold px-4 py-2 rounded-xl shadow inline-flex items-center space-x-1.5 border border-amber-300/30"
              >
                <AddIcon size={16} />
                <span>Curate the First Photograph</span>
              </button>
            )}
          </div>
        ) : (
          /* Responsive Gallery Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {photos.map((photo, index) => (
              <article
                key={photo.id}
                onClick={() => setViewerIndex(index)}
                className="group bg-white rounded-3xl border border-amber-900/10 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col justify-between hover:border-amber-400/40"
              >
                <div>
                  {/* Photo Frame Container */}
                  <div className="relative w-full aspect-[4/3] bg-slate-900 overflow-hidden">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title || 'Archival Photograph'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80';
                      }}
                    />

                    {/* Subtle Gallery Vignette Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                    {/* Category Label Pill */}
                    <span className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-xs text-[#091734] font-serif font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                      {photo.category}
                    </span>

                    {/* Admin Edit/Delete Controls on Card (Only visible to Admin) */}
                    {isAdmin && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/65 backdrop-blur-xs p-1 rounded-xl"
                      >
                        <button
                          onClick={(e) => handleEditPhoto(photo, e)}
                          title="Edit Photograph"
                          className="p-1 rounded-lg text-amber-300 hover:text-white hover:bg-white/20 transition-colors"
                        >
                          <EditIcon size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeletePhoto(photo.id, e)}
                          title="Remove Photograph"
                          className="p-1 rounded-lg text-rose-400 hover:text-white hover:bg-white/20 transition-colors"
                        >
                          <DeleteIcon size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Curatorial Caption Plate (Clean, No Social Clutter) */}
                  <div className="p-5">
                    {photo.title && (
                      <h3 className="font-serif font-bold text-base text-[#091734] leading-snug group-hover:text-[#1E3A8A] transition-colors line-clamp-1">
                        {photo.title}
                      </h3>
                    )}

                    {photo.caption && (
                      <p className="text-xs text-slate-600 font-serif mt-1.5 line-clamp-2 leading-relaxed">
                        {photo.caption}
                      </p>
                    )}
                  </div>
                </div>

                {/* Minimal Archival Footer Plate */}
                <div className="px-5 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-serif">
                  <div className="flex items-center space-x-1 truncate max-w-[70%]">
                    <MapPin size={11} className="text-amber-800 shrink-0" />
                    <span className="truncate">{photo.location || 'University Campus'}</span>
                  </div>
                  <span>{photo.year || '2026'}</span>
                </div>

              </article>
            ))}
          </div>
        )}

      </main>

      {/* Full-screen Lightbox Image Viewer */}
      {viewerIndex !== null && (
        <MagazineImageViewer
          photos={photos}
          currentIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onNavigate={(newIdx) => setViewerIndex(newIdx)}
        />
      )}

      {/* Admin Photo Curator Modal */}
      {isAdmin && (
        <AdminPhotoModal
          isOpen={isCuratorModalOpen}
          photoToEdit={photoToEdit}
          onClose={() => {
            setIsCuratorModalOpen(false);
            setPhotoToEdit(null);
          }}
          onSaved={handleSaved}
        />
      )}

    </div>
  );
}
