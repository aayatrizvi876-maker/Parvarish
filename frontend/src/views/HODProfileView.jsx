import React from 'react';
import { ProfileView } from './ProfileView';

export function HODProfileView({ profileUserId, onOpenPost, onClose }) {
  return (
    <ProfileView
      profileUserId={profileUserId}
      onOpenPost={onOpenPost}
      onClose={onClose}
      onBack={onClose}
    />
  );
}
