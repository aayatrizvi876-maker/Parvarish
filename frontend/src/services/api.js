import { Capacitor } from '@capacitor/core';

const envApiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
const API_BASE = envApiUrl 
  ? `${envApiUrl}/api` 
  : (Capacitor.isNativePlatform() ? 'http://10.0.2.2:5000/api' : '/api');

function getAuthHeaders() {
  const token = localStorage.getItem('parvarish_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth API
  async googleAuth(googleData) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData)
    });
    return handleResponse(res);
  },

  async syncSession(sessionData) {
    const res = await fetch(`${API_BASE}/auth/sync-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
    return handleResponse(res);
  },

  async universityLogin(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  async setRole(role) {
    const res = await fetch(`${API_BASE}/auth/role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ role })
    });
    return handleResponse(res);
  },

  async verifyAdmin(verificationCode) {
    const res = await fetch(`${API_BASE}/auth/verify-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ verificationCode })
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Posts API
  async getPosts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/posts?${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getPostById(id) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createPost(postData) {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(postData)
    });
    return handleResponse(res);
  },

  async updatePost(id, postData) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(postData)
    });
    return handleResponse(res);
  },

  async deletePost(id) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async likePost(id) {
    const res = await fetch(`${API_BASE}/posts/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async unlikePost(id) {
    const res = await fetch(`${API_BASE}/posts/${id}/like`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async savePost(id) {
    const res = await fetch(`${API_BASE}/posts/${id}/save`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async unsavePost(id) {
    const res = await fetch(`${API_BASE}/posts/${id}/save`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getSavedPosts() {
    const res = await fetch(`${API_BASE}/posts/saved`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getMagazineEditions() {
    const res = await fetch(`${API_BASE}/magazine/editions`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Comments API
  async getComments(postId) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async addComment(postId, content, parentCommentId = null) {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ content, parentCommentId })
    });
    return handleResponse(res);
  },

  async likeComment(commentId) {
    const res = await fetch(`${API_BASE}/comments/${commentId}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async unlikeComment(commentId) {
    const res = await fetch(`${API_BASE}/comments/${commentId}/like`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async reportComment(commentId, reason) {
    const res = await fetch(`${API_BASE}/comments/${commentId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ reason })
    });
    return handleResponse(res);
  },

  // Follows API
  async followUser(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}/follow`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async unfollowUser(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}/follow`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getFollowers(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}/followers`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // User Profile API
  async getUserProfile(userId) {
    const res = await fetch(`${API_BASE}/users/${userId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Events API
  async getEvents(status) {
    const query = status ? `?status=${status}` : '';
    const res = await fetch(`${API_BASE}/events${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createEvent(eventData) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(eventData)
    });
    return handleResponse(res);
  },

  async deleteEvent(id) {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Achievements API
  async getAchievements() {
    const res = await fetch(`${API_BASE}/achievements`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async createAchievement(achievementData) {
    const res = await fetch(`${API_BASE}/achievements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(achievementData)
    });
    return handleResponse(res);
  },

  async deleteAchievement(id) {
    const res = await fetch(`${API_BASE}/achievements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Notifications API
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Admin APIs
  async getAdminModeration(status = 'PENDING') {
    const res = await fetch(`${API_BASE}/admin/moderation?status=${status}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async moderateReport(reportId, action) {
    const res = await fetch(`${API_BASE}/admin/moderation/${reportId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ action })
    });
    return handleResponse(res);
  },

  async getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/users?${query}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async updateUserStatus(userId, status) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async updateUserRole(userId, role) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ role })
    });
    return handleResponse(res);
  },

  async getAdminAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // File Upload API
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });
    return handleResponse(res);
  }
};
