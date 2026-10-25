import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon,
  VideoIcon,
  MagazineIcon,
  ProfileIcon,
  SettingsIcon,
  UniversityIcon
} from './icons/ParvarishIcons';
import { LayoutDashboard, LogOut } from 'lucide-react';

export function SidebarNav({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'video', label: 'Video', icon: VideoIcon },
    { id: 'magazine', label: 'Magazine', icon: MagazineIcon },
    { id: 'profile', label: 'Profile', icon: ProfileIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 lg:w-72 bg-[#091734] text-white flex flex-col justify-between h-screen sticky top-0 shrink-0 border-r border-[#15274d] select-none z-30 shadow-2xl">
      
      {/* Top Section: Masthead & Nav Links */}
      <div className="p-6">
        {/* Masthead Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-10 h-10 text-[#F6EEDB] flex items-center justify-center mb-2">
            <MagazineIcon size={32} selected={true} doorColor="#091734" spineColor="#091734" className="text-[#F6EEDB]" />
          </div>
          <h1 className="font-serif text-2xl tracking-[0.16em] text-[#F6EEDB] font-bold">
            PARVARISH
          </h1>
          <p className="font-serif italic text-xs text-[#C5A880] mt-1.5 leading-snug">
            The Official University<br />Social Magazine
          </p>
          <div className="w-10 h-[1px] bg-[#C5A880]/30 mt-4"></div>
        </div>

        {/* HOD Create Post Primary Button */}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('create')}
            className="w-full mb-4 bg-gradient-to-r from-[#C5A880] to-[#E3C9A6] hover:from-[#bfa175] hover:to-[#dbbf98] text-[#091734] font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="text-xl font-bold leading-none">+</span>
            <span className="tracking-wide text-sm font-serif">Create Post</span>
          </button>
        )}

        {/* Navigation Items List */}
        <nav className="space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm transition-all text-left group sidebar-nav-item ${
                  isActive
                    ? 'sidebar-nav-active font-bold shadow-sm'
                    : 'sidebar-nav-inactive font-medium hover:bg-white/10'
                }`}
                style={isActive ? {
                  backgroundColor: '#F5EEDC',
                  color: '#0B1B3A'
                } : {
                  backgroundColor: 'transparent',
                  color: '#F5F0E3'
                }}
              >
                <Icon 
                  size={20} 
                  selected={isActive}
                  doorColor={isActive ? "#F5EEDC" : "#091734"}
                  spineColor={isActive ? "#F5EEDC" : "#091734"}
                  className={isActive ? 'sidebar-icon-active' : 'sidebar-icon-inactive group-hover:text-white'} 
                  style={{
                    color: isActive ? '#0B1B3A' : '#D6D9E2'
                  }}
                />
                <span 
                  className="tracking-wide"
                  style={{
                    color: isActive ? '#0B1B3A' : '#F5F0E3'
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Admin Dashboard shortcut if HOD */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-xl text-sm transition-all text-left mt-3 border sidebar-nav-item ${
                activeTab === 'dashboard'
                  ? 'sidebar-nav-active font-bold shadow-sm border-[#F5EEDC]'
                  : 'sidebar-nav-inactive border-amber-500/20 font-medium hover:bg-white/10'
              }`}
              style={activeTab === 'dashboard' ? {
                backgroundColor: '#F5EEDC',
                color: '#0B1B3A'
              } : {
                backgroundColor: 'transparent',
                color: '#F5F0E3'
              }}
            >
              <LayoutDashboard 
                size={19} 
                className="stroke-[1.75]"
                style={{
                  color: activeTab === 'dashboard' ? '#0B1B3A' : '#D6D9E2'
                }}
              />
              <span 
                className="tracking-wide"
                style={{
                  color: activeTab === 'dashboard' ? '#0B1B3A' : '#F5F0E3'
                }}
              >
                HOD Studio
              </span>
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Section: Architectural Heritage Illustration & Motto */}
      <div className="px-6 pb-6 pt-2 flex flex-col items-center">
        {/* Golden Architectural Line Art of University Heritage Building */}
        <div className="w-full max-w-[210px] text-[#C5A880]/90">
          <svg viewBox="0 0 240 120" className="w-full h-auto drop-shadow-xs" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
            {/* Ground / Baseline */}
            <line x1="10" y1="105" x2="230" y2="105" strokeWidth="1.5" />
            <line x1="20" y1="108" x2="220" y2="108" strokeWidth="0.8" opacity="0.6" />

            {/* Trees Left */}
            <path d="M18 105 Q12 90 20 80 Q14 70 24 62 Q34 72 28 85 Q36 95 30 105" strokeWidth="0.8" opacity="0.75" />
            <path d="M25 80 Q22 68 30 58 Q38 68 34 82" strokeWidth="0.7" opacity="0.6" />

            {/* Trees Right */}
            <path d="M222 105 Q228 90 220 80 Q226 70 216 62 Q206 72 212 85 Q204 95 210 105" strokeWidth="0.8" opacity="0.75" />
            <path d="M215 80 Q218 68 210 58 Q202 68 206 82" strokeWidth="0.7" opacity="0.6" />

            {/* Left Wing Facade */}
            <rect x="35" y="70" width="45" height="35" />
            <line x1="35" y1="67" x2="80" y2="67" strokeWidth="1.2" />
            <line x1="42" y1="78" x2="42" y2="95" strokeWidth="0.8" />
            <line x1="50" y1="78" x2="50" y2="95" strokeWidth="0.8" />
            <line x1="58" y1="78" x2="58" y2="95" strokeWidth="0.8" />
            <line x1="66" y1="78" x2="66" y2="95" strokeWidth="0.8" />
            <line x1="73" y1="78" x2="73" y2="95" strokeWidth="0.8" />
            {/* Left Balustrade / Roofline */}
            <line x1="33" y1="64" x2="82" y2="64" strokeWidth="1.5" />
            <path d="M40 64 L40 60 M50 64 L50 60 M60 64 L60 60 M70 64 L70 60 M75 64 L75 60" strokeWidth="0.8" />

            {/* Right Wing Facade */}
            <rect x="160" y="70" width="45" height="35" />
            <line x1="160" y1="67" x2="205" y2="67" strokeWidth="1.2" />
            <line x1="167" y1="78" x2="167" y2="95" strokeWidth="0.8" />
            <line x1="174" y1="78" x2="174" y2="95" strokeWidth="0.8" />
            <line x1="182" y1="78" x2="182" y2="95" strokeWidth="0.8" />
            <line x1="190" y1="78" x2="190" y2="95" strokeWidth="0.8" />
            <line x1="198" y1="78" x2="198" y2="95" strokeWidth="0.8" />
            {/* Right Balustrade / Roofline */}
            <line x1="158" y1="64" x2="207" y2="64" strokeWidth="1.5" />
            <path d="M165 64 L165 60 M175 64 L175 60 M185 64 L185 60 M195 64 L195 60 M200 64 L200 60" strokeWidth="0.8" />

            {/* Central Portico / Colonnade */}
            <rect x="80" y="65" width="80" height="40" />
            {/* Grand Steps */}
            <line x1="82" y1="102" x2="158" y2="102" strokeWidth="1" />
            <line x1="85" y1="99" x2="155" y2="99" strokeWidth="1" />

            {/* Classical Columns (6 columns) */}
            <line x1="88" y1="65" x2="88" y2="99" strokeWidth="1.3" />
            <line x1="100" y1="65" x2="100" y2="99" strokeWidth="1.3" />
            <line x1="112" y1="65" x2="112" y2="99" strokeWidth="1.3" />
            <line x1="128" y1="65" x2="128" y2="99" strokeWidth="1.3" />
            <line x1="140" y1="65" x2="140" y2="99" strokeWidth="1.3" />
            <line x1="152" y1="65" x2="152" y2="99" strokeWidth="1.3" />

            {/* Central Entrance Arch */}
            <path d="M115 99 L115 82 Q120 76 125 82 L125 99" strokeWidth="1.1" />

            {/* Entablature & Pediment (Triangle) */}
            <line x1="78" y1="65" x2="162" y2="65" strokeWidth="1.8" />
            <line x1="80" y1="62" x2="160" y2="62" strokeWidth="1" />
            <polygon points="78,62 120,45 162,62" strokeWidth="1.5" />
            {/* Pediment Tympanum Medallion */}
            <circle cx="120" cy="55" r="3.5" strokeWidth="0.8" />

            {/* Central Drum & Grand Dome */}
            <rect x="100" y="32" width="40" height="13" />
            <line x1="98" y1="32" x2="142" y2="32" strokeWidth="1.2" />
            {/* Drum Windows */}
            <line x1="106" y1="35" x2="106" y2="42" strokeWidth="0.8" />
            <line x1="114" y1="35" x2="114" y2="42" strokeWidth="0.8" />
            <line x1="120" y1="35" x2="120" y2="42" strokeWidth="0.8" />
            <line x1="126" y1="35" x2="126" y2="42" strokeWidth="0.8" />
            <line x1="134" y1="35" x2="134" y2="42" strokeWidth="0.8" />

            {/* The Dome Arc */}
            <path d="M98 32 C98 12, 142 12, 142 32" strokeWidth="1.6" />
            {/* Rib lines on dome */}
            <path d="M107 32 C108 18, 120 14, 120 14" strokeWidth="0.7" opacity="0.7" />
            <path d="M133 32 C132 18, 120 14, 120 14" strokeWidth="0.7" opacity="0.7" />

            {/* Cupola & Finial on top */}
            <rect x="117" y="9" width="6" height="5" strokeWidth="1" />
            <line x1="120" y1="9" x2="120" y2="4" strokeWidth="1.2" />
            <circle cx="120" cy="3.5" r="1.2" fill="currentColor" />
          </svg>
        </div>

        {/* Motto / Quotation */}
        <p className="font-serif italic text-xs text-[#C5A880] text-center mt-3 leading-snug tracking-wide">
          “Ideas today,<br />A stronger tomorrow.”
        </p>
        <div className="w-9 h-[1.5px] bg-[#C5A880] mx-auto mt-2.5 opacity-80"></div>
      </div>

    </aside>
  );
}
