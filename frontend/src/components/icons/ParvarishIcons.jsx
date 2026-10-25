import React from 'react';

/**
 * Parvarish University App Official SVG Icon Set
 * 24x24 viewBox transparent SVGs with selected / unselected states & theme behaviors
 * Primary Ivory: #FFF4DC / #F6EEDB
 * Primary Navy: #071F5C / #091734
 */

// Base Wrapper for consistent sizing and styling
const IconBase = ({ size = 24, className = '', children, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`inline-block shrink-0 transition-all ${className}`}
    {...props}
  >
    {children}
  </svg>
);

// ==========================================
// 1. NAVIGATION ICONS (Selected & Unselected)
// ==========================================

export const HomeIcon = ({ size = 24, selected = false, doorColor, className = '', ...props }) => {
  if (selected) {
    return (
      <IconBase size={size} className={className} {...props}>
        {/* Filled ivory body with navy door cutout */}
        <path
          d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10.5Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 21V14H15V21"
          fill="none"
          stroke={doorColor || 'var(--home-door-stroke, #071F5C)'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </IconBase>
    );
  }
  return (
    <IconBase size={size} className={className} {...props}>
      <path
        d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V10.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 21V14H15V21"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
  );
};

export const MagazineIcon = ({ size = 24, selected = false, spineColor, className = '', ...props }) => {
  if (selected) {
    return (
      <IconBase size={size} className={className} {...props}>
        <path
          d="M4 4.5C6.8 3.2 9.4 3.4 12 5V20C9.4 18.4 6.8 18.2 4 19.5V4.5Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 4.5C17.2 3.2 14.6 3.4 12 5V20C14.6 18.4 17.2 18.2 20 19.5V4.5Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 5L12 20"
          stroke={spineColor || 'var(--mag-spine-stroke, #071F5C)'}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </IconBase>
    );
  }
  return (
    <IconBase size={size} className={className} {...props}>
      <path
        d="M4 4.5C6.8 3.2 9.4 3.4 12 5V20C9.4 18.4 6.8 18.2 4 19.5V4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 4.5C17.2 3.2 14.6 3.4 12 5V20C14.6 18.4 17.2 18.2 20 19.5V4.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 5L12 20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </IconBase>
  );
};

export const ExploreIcon = ({ size = 24, selected = false, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle
      cx="10.5"
      cy="10.5"
      r="6.5"
      fill={selected ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

// ==========================================
// 2. SOCIAL ICONS & INTERACTIVE BEHAVIORS
// ==========================================

export const LikeIcon = ({ size = 24, liked = false, className = '', ...props }) => (
  <IconBase
    size={size}
    className={`${liked ? 'text-rose-600 scale-105' : ''} ${className}`}
    {...props}
  >
    <path
      d="M20.8 8.9C20.8 13.8 12 20 12 20S3.2 13.8 3.2 8.9C3.2 6.1 5.2 4 8 4C9.7 4 11.1 4.9 12 6.2C12.9 4.9 14.3 4 16 4C18.8 4 20.8 6.1 20.8 8.9Z"
      fill={liked ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const CommentIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M20 11.5C20 15.1 16.4 18 12 18C10.9 18 9.8 17.8 8.8 17.5L4 20L5.4 16.2C4.5 14.9 4 13.3 4 11.5C4 7.9 7.6 5 12 5C16.4 5 20 7.9 20 11.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const SaveIcon = ({ size = 24, saved = false, className = '', ...props }) => (
  <IconBase
    size={size}
    className={`${saved ? 'text-amber-500 md:text-slate-900 scale-105' : ''} ${className}`}
    {...props}
  >
    <path
      d="M6 4H18V21L12 17.2L6 21V4Z"
      fill={saved ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const ShareIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle cx="6" cy="12" r="2.3" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="6" r="2.3" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="18" r="2.3" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M8 11L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 13L16 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

// ==========================================
// 3. PROFILE & FOLLOW BEHAVIOR
// ==========================================

export const ProfileIcon = ({ size = 24, selected = false, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle
      cx="12"
      cy="8"
      r="3.2"
      fill={selected ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M5 20C5.8 16.5 8.3 14.5 12 14.5C15.7 14.5 18.2 16.5 19 20"
      fill={selected ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const FollowIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      d="M3 20C3.7 16.8 5.8 15 9 15C12.2 15 14.3 16.8 15 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M18 9L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 12L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const FollowingIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle cx="9" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      d="M3 20C3.7 16.8 5.8 15 9 15C12.2 15 14.3 16.8 15 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 13L18 15L22 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

// ==========================================
// 4. ACADEMIC & INSTITUTIONAL
// ==========================================

export const AnnouncementIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M4 11H8L17 6V18L8 13H4V11Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 13L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M20 9C21 10 21 14 20 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const DepartmentIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M4 20V8L12 4L20 8V20H4Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 10L8 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 10L12 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 10L16 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 20L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const UniversityIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M3 9L12 4L21 9L12 13L3 9Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M5 10L5 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M19 10L19 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 19L20 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 12L8 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 13L12 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 12L16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const MyPostsIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M5 3H15L19 7V21H5V3Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 3V8H19"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 12L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 16L15 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

// ==========================================
// 5. COMMUNICATION
// ==========================================

export const AttachmentIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M8.5 12.5L14.7 6.3C16.4 4.6 19.2 4.6 20.9 6.3C22.6 8 22.6 10.8 20.9 12.5L11.2 22.2C8.8 24.6 4.9 24.6 2.5 22.2C0.1 19.8 0.1 15.9 2.5 13.5L11.8 4.2C13.4 2.6 16 2.6 17.6 4.2C19.2 5.8 19.2 8.4 17.6 10L8.5 19.1C7.7 19.9 6.4 19.9 5.6 19.1C4.8 18.3 4.8 17 5.6 16.2L13.6 8.2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const EmailIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M3 6H21V18H3V6Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 7L12 14L21 7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const NotificationIcon = ({ size = 24, hasUnread = false, selected = false, className = '', ...props }) => (
  <div className="relative inline-flex items-center justify-center">
    <IconBase size={size} className={className} {...props}>
      <path
        d="M6 17H18L16.8 15V10C16.8 7.2 14.8 5 12 5C9.2 5 7.2 7.2 7.2 10V15L6 17Z"
        fill={selected ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 20C10.5 21 13.5 21 14 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </IconBase>
    {hasUnread && (
      <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
    )}
  </div>
);

// ==========================================
// 6. UTILITY ICONS
// ==========================================

export const VideoIcon = ({ size = 24, selected = false, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M4 6H14V18H4V6Z"
      fill={selected ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 10L20 7V17L14 14V10Z"
      fill={selected ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const SettingsIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      d="M19 13.5L21 15L19 18L16.5 17L14.5 18L14 21H10L9.5 18L7.5 17L5 18L3 15L5 13.5V10.5L3 9L5 6L7.5 7L9.5 6L10 3H14L14.5 6L16.5 7L19 6L21 9L19 10.5V13.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const MoreIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="currentColor" strokeWidth="2" />
  </IconBase>
);

export const RefreshIcon = ({ size = 24, spinning = false, className = '', ...props }) => (
  <IconBase
    size={size}
    className={`${spinning ? 'animate-spin' : ''} ${className}`}
    {...props}
  >
    <path
      d="M20 11A8 8 0 0 0 6 6L4 8M4 4V8H8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 13A8 8 0 0 0 18 18L20 16M20 20V16H16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const AddIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 8L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 12L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const BackIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M19 12H5M11 6L5 12L11 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const ForwardIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M5 12H19M13 6L19 12L13 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const CloseIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const CalendarIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M5 5H19V20H5V5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M5 9L19 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 3L8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const TimeIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const EditIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M4 20L5.2 15.3L15.8 4.7C16.7 3.8 18.2 3.8 19.1 4.7L19.3 4.9C20.2 5.8 20.2 7.3 19.3 8.2L8.7 18.8L4 20Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 6L18 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const DeleteIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M5 7H19M9 7V4H15V7M7 7L8 20H16L17 7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M10 10L10 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 10L14 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const EyeIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M3 12S6.3 6 12 6S21 12 21 12S17.7 18 12 18S3 12 3 12Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="2" />
  </IconBase>
);

export const FilterIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M4 5H20L14 12V19L10 21V12L4 5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const SortIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path d="M7 5L7 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M4 16L7 19L10 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M17 19L17 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M14 8L17 5L20 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </IconBase>
);

export const LinkIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M10 13.5L8.5 15C6.8 16.7 4 16.7 2.3 15C0.6 13.3 0.6 10.5 2.3 8.8L5.2 5.9C6.9 4.2 9.7 4.2 11.4 5.9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 10.5L15.5 9C17.2 7.3 20 7.3 21.7 9C23.4 10.7 23.4 13.5 21.7 15.2L18.8 18.1C17.1 19.8 14.3 19.8 12.6 18.1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 16L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const LocationIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path
      d="M12 21S19 14.7 19 9.5C19 5.9 15.9 3 12 3C8.1 3 5 5.9 5 9.5C5 14.7 12 21 12 21Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9.5" r="2.2" fill="none" stroke="currentColor" strokeWidth="2" />
  </IconBase>
);

export const MenuIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <path d="M4 7L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 12L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4 17L20 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </IconBase>
);

export const HelpIcon = ({ size = 24, className = '', ...props }) => (
  <IconBase size={size} className={className} {...props}>
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
    <path
      d="M9.5 9A2.7 2.7 0 0 1 12 7.3C13.8 7.3 15 8.4 15 10C15 11.5 14 12.2 12.8 13.1C12 13.7 11.7 14.2 11.7 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="18" r="0.7" fill="currentColor" stroke="currentColor" strokeWidth="2" />
  </IconBase>
);
