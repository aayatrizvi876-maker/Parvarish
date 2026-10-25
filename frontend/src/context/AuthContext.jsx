import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  supabase, 
  isSupabaseConfigured, 
  isValidEmail, 
  normalizeEmail, 
  signInWithUniversityEmail, 
  signInWithGoogleOAuth,
  isGoogleProviderEnabled
} from '../services/supabase';

const AuthContext = createContext();

export function getUserProfileKey(u) {
  if (!u) return 'parvarish_profile_guest';
  if (u.role === 'ADMIN') return 'parvarish_profile_admin_hod';
  const cleanId = (u.email || u.id || 'student').toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `parvarish_profile_${cleanId}`;
}

export function getDefaultProfileForUser(u) {
  if (!u) {
    return {
      prefix: 'Mr.',
      name: 'Student Member',
      bio: 'Exploring ideas, capturing moments, and being a part of the PARVARISH community.',
      department: 'Computer Science',
      year: '3rd Year',
      university: 'United University',
      avatarType: 'custom_image',
      avatarUrl: '',
      coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85',
      postsCount: 0,
      followersCount: 0,
      followingCount: 0
    };
  }

  if (u.role === 'ADMIN') {
    return {
      prefix: 'Prof. Dr.',
      name: 'Head of Department',
      bio: 'Head of Department, Computer Science & Engineering. Official PARVARISH university publisher.',
      department: 'Computer Science & Engineering',
      year: 'Faculty Head',
      university: 'United University',
      avatarType: 'custom_image',
      avatarUrl: u.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85',
      postsCount: 4,
      followersCount: 1420,
      followingCount: 12
    };
  }

  const isFaculty = u.role === 'FACULTY';
  const displayName = u.name || (u.email ? u.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Student Member');
  const avatar = u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

  return {
    prefix: isFaculty ? 'Dr.' : 'Mr.',
    name: displayName,
    email: u.email || '',
    bio: isFaculty ? 'Faculty Member, Academic & Research Mentor.' : 'Student Member at United University. Exploring ideas, capturing moments.',
    department: u.department || 'Computer Science',
    year: isFaculty ? 'Faculty' : '3rd Year',
    university: 'United University',
    avatarType: 'custom_image',
    avatarUrl: avatar,
    coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85',
    postsCount: 1,
    followersCount: 14,
    followingCount: 22
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('parvarish_user_session');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [token, setToken] = useState(localStorage.getItem('parvarish_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [pendingAdminVerify, setPendingAdminVerify] = useState(false);
  const [isSelectingRole, setIsSelectingRole] = useState(false);
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);

  // User-Scoped Profile State
  const [profileData, setProfileData] = useState(() => {
    if (!user) return getDefaultProfileForUser(null);
    try {
      const key = getUserProfileKey(user);
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return getDefaultProfileForUser(user);
  });

  const updateProfileData = (updatedFields) => {
    setProfileData(prev => {
      const merged = {
        ...prev,
        ...updatedFields,
        university: 'United University'
      };

      if (user) {
        try {
          const key = getUserProfileKey(user);
          localStorage.setItem(key, JSON.stringify(merged));
        } catch (e) {}
      }

      setUser(current => {
        if (!current) return current;
        const updated = {
          ...current,
          name: merged.name || current.name,
          department: merged.department || current.department,
          bio: merged.bio || current.bio,
          profileImage: merged.avatarUrl || current.profileImage,
          coverImage: merged.coverUrl || current.coverImage
        };
        try {
          localStorage.setItem('parvarish_user_session', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      window.dispatchEvent(new CustomEvent('parvarish_profile_sync', { detail: merged }));
      return merged;
    });
  };

  // Sync profileData when user object changes (switching user account or switching role)
  useEffect(() => {
    if (user) {
      const key = getUserProfileKey(user);
      let loaded = null;
      try {
        const saved = localStorage.getItem(key);
        if (saved) loaded = JSON.parse(saved);
      } catch (e) {}

      const defaultProfile = getDefaultProfileForUser(user);
      const isHOD = user.role === 'ADMIN';

      const merged = {
        ...defaultProfile,
        ...(loaded || {}),
        name: isHOD 
          ? (loaded?.name || 'Head of Department')
          : (loaded?.name || user.name || defaultProfile.name),
        avatarUrl: isHOD 
          ? (loaded?.avatarUrl || defaultProfile.avatarUrl) 
          : (loaded?.avatarUrl || user.profileImage || defaultProfile.avatarUrl),
        department: loaded?.department || user.department || defaultProfile.department,
        university: 'United University'
      };

      setProfileData(merged);
      try {
        localStorage.setItem(key, JSON.stringify(merged));
      } catch (e) {}
    } else {
      setProfileData(getDefaultProfileForUser(null));
    }
  }, [user?.id, user?.email, user?.role]);

  // Initialize and check active session
  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      setIsLoading(true);

      // Check for incoming OAuth redirect error in URL hash or search params
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const searchParams = new URLSearchParams(window.location.search);
        const oauthError = hashParams.get('error_description') || 
                           searchParams.get('error_description') ||
                           hashParams.get('error') || 
                           searchParams.get('error');

        if (oauthError && isMounted) {
          window.history.replaceState({}, document.title, window.location.pathname);
          const decoded = decodeURIComponent(oauthError.replace(/\+/g, ' '));
          setAuthError(decoded);
        }
      } catch (e) {
        console.warn('Error reading URL OAuth params:', e);
      }

      // 1. If Supabase is configured, check for Supabase session (e.g. following OAuth redirect)
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) {
            console.warn('Supabase session fetch warning:', error.message);
          } else if (session?.user) {
            const authEmail = normalizeEmail(session.user.email);
            const userMetadata = session.user.user_metadata || {};

            // Synchronize authenticated identity with application backend (or direct Supabase fallback)
            let resUser = null;
            let resToken = null;
            try {
              const res = await api.syncSession({
                email: authEmail,
                name: userMetadata.full_name || userMetadata.name || authEmail.split('@')[0],
                profileImage: userMetadata.avatar_url || userMetadata.picture || null,
                supabaseUid: session.user.id
              });
              resUser = res.user;
              resToken = res.token;
            } catch (syncErr) {
              // Direct standalone fallback for Netlify static deployments
              resUser = {
                id: session.user.id,
                name: userMetadata.full_name || userMetadata.name || authEmail.split('@')[0],
                email: authEmail,
                profileImage: userMetadata.avatar_url || userMetadata.picture || null,
                role: 'STUDENT',
                designation: 'Student Member',
                department: 'Computer Science',
                institution: 'United University',
                isVerified: false
              };
              resToken = session.access_token || 'parvarish_session_active';
            }

            if (isMounted && resUser) {
              localStorage.setItem('parvarish_token', resToken);
              setToken(resToken);
              setUser(resUser);
              setIsSelectingRole(true);
              setAuthError(null);
            }
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.error('Supabase initial session check error:', err);
        }
      }

      // 2. Check Remember Me preference and restore local session
      const storedToken = localStorage.getItem('parvarish_token');
      const savedUserSession = localStorage.getItem('parvarish_user_session');

      if (storedToken || savedUserSession) {
        try {
          const data = await api.getMe();
          if (data?.user) {
            if (isMounted) {
              setUser(data.user);
              setToken(storedToken || `token_${Date.now()}`);
            }
          }
        } catch (err) {
          console.warn('Session check warning:', err.message);
        }
      }

      if (isMounted) setIsLoading(false);
    }

    initializeAuth();

    // Setup Supabase auth state change listener if available
    let authListener = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const authEmail = normalizeEmail(session.user.email);
          try {
            const userMetadata = session.user.user_metadata || {};
            let resUser = null;
            let resToken = null;
            try {
              const res = await api.syncSession({
                email: authEmail,
                name: userMetadata.full_name || userMetadata.name || authEmail.split('@')[0],
                profileImage: userMetadata.avatar_url || userMetadata.picture || null,
                supabaseUid: session.user.id
              });
              resUser = res.user;
              resToken = res.token;
            } catch (syncErr) {
              resUser = {
                id: session.user.id,
                name: userMetadata.full_name || userMetadata.name || authEmail.split('@')[0],
                email: authEmail,
                profileImage: userMetadata.avatar_url || userMetadata.picture || null,
                role: 'STUDENT',
                designation: 'Student Member',
                department: 'Computer Science',
                institution: 'United University',
                isVerified: false
              };
              resToken = session.access_token || 'parvarish_session_active';
            }

            localStorage.setItem('parvarish_token', resToken);
            setToken(resToken);
            setUser(resUser);
            setIsSelectingRole(true);
            setAuthError(null);
          } catch (err) {
            setAuthError(err.message);
          }
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('parvarish_token');
          setToken(null);
          setUser(null);
        }
      });
      authListener = data.subscription;
    }

    return () => {
      isMounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  // Email & Password Login Flow
  const loginWithUniversityEmail = async (email, password, rememberMe = true) => {
    setIsLoading(true);
    setAuthError(null);

    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      setIsLoading(false);
      const errMsg = 'Please enter a valid email address.';
      setAuthError(errMsg);
      throw new Error(errMsg);
    }

    // Try Supabase Auth first if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const authData = await signInWithUniversityEmail(normalizedEmail, password);
        const authUser = authData.user;

        const res = await api.syncSession({
          email: normalizedEmail,
          name: authUser?.user_metadata?.full_name || normalizedEmail.split('@')[0],
          supabaseUid: authUser?.id
        });

        localStorage.setItem('parvarish_token', res.token);
        if (rememberMe) {
          localStorage.setItem('parvarish_remember_me', 'true');
        } else {
          localStorage.removeItem('parvarish_remember_me');
        }

        setToken(res.token);
        setUser(res.user);
        setIsSelectingRole(true);
        return res.user;
      } catch (err) {
        // Fall back to backend database verification if Supabase reports invalid credentials
        try {
          const res = await api.universityLogin({ email: normalizedEmail, password });
          localStorage.setItem('parvarish_token', res.token);
          if (rememberMe) {
            localStorage.setItem('parvarish_remember_me', 'true');
          }
          setToken(res.token);
          setUser(res.user);
          setIsSelectingRole(true);
          return res.user;
        } catch (backendErr) {
          const displayMsg = err.message || backendErr.message || 'Invalid email or password.';
          setAuthError(displayMsg);
          throw new Error(displayMsg);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local backend login
      try {
        const res = await api.universityLogin({ email: normalizedEmail, password });
        localStorage.setItem('parvarish_token', res.token);
        if (rememberMe) {
          localStorage.setItem('parvarish_remember_me', 'true');
        }
        setToken(res.token);
        setUser(res.user);
        setIsSelectingRole(true);
        return res.user;
      } catch (err) {
        const displayMsg = err.message || 'Invalid email or password.';
        setAuthError(displayMsg);
        throw new Error(displayMsg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Google Login Flow (Accepts normal Google accounts, @gmail.com, etc.)
  const loginWithGoogle = async (directAccount = null) => {
    setIsLoading(true);
    setAuthError(null);

    // 1. Direct Google Account Resolution (Instant Normal Google Sign-In)
    if (directAccount && directAccount.email) {
      try {
        const res = await api.googleAuth({
          googleId: directAccount.id || `google_${Date.now()}`,
          name: directAccount.name,
          email: directAccount.email,
          profileImage: directAccount.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(directAccount.name || directAccount.email)}`
        });

        localStorage.setItem('parvarish_token', res.token);
        localStorage.setItem('parvarish_remember_me', 'true');
        setToken(res.token);
        setUser(res.user);
        setIsSelectingRole(true);
        return res.user;
      } catch (err) {
        setAuthError(err.message || 'Google authentication failed.');
        throw err;
      } finally {
        setIsLoading(false);
      }
    }

    // 2. Supabase OAuth Flow if Provider is Enabled
    if (isSupabaseConfigured && supabase) {
      const isEnabled = await isGoogleProviderEnabled();
      if (isEnabled) {
        try {
          await signInWithGoogleOAuth();
          return;
        } catch (err) {
          setIsLoading(false);
          setAuthError(err.message);
          throw err;
        }
      }
    }

    // If Supabase Google OAuth provider is not enabled in dashboard yet, signal UI
    setIsLoading(false);
    throw new Error('NEEDS_GOOGLE_EMAIL');
  };

  // Role Selection Flow -> Require Passcode for HOD Admin
  const selectRole = async (role) => {
    setAuthError(null);
    if (role === 'ADMIN') {
      setIsSelectingRole(false);
      setPendingAdminVerify(true);
      return;
    }
    setIsLoading(true);
    try {
      try {
        const res = await api.setRole(role);
        localStorage.setItem('parvarish_token', res.token);
        setToken(res.token);
        setUser(res.user);
      } catch (backendErr) {
        // Standalone fallback for static web hosting
        setUser(prev => {
          const updated = {
            ...prev,
            role: role,
            designation: role === 'FACULTY' ? 'Faculty Member' : 'Student Member',
            isVerified: false
          };
          try {
            localStorage.setItem('parvarish_user_session', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }
      setIsSelectingRole(false);
      setIsSettingUpProfile(false);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Verification Flow (Server-side check with standalone fallback)
  const verifyAdmin = async (verificationCode) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      try {
        const res = await api.verifyAdmin(verificationCode);
        localStorage.setItem('parvarish_token', res.token);
        localStorage.setItem('parvarish_user_session', JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
      } catch (backendErr) {
        // Fallback passcode validation for standalone Netlify deployment
        const cleaned = (verificationCode || '').trim().toUpperCase();
        if (['PARVARISH_HOD_2026', 'HOD2026', 'ADMIN2026', 'ADMIN', 'HOD', '123456'].includes(cleaned)) {
          const hodUser = {
            id: 'usr_hod_official_001',
            name: 'Head of Department',
            email: 'hod.cse@uniteduniversity.edu.in',
            role: 'ADMIN',
            designation: 'Head of Department',
            department: 'Computer Science & Engineering',
            institution: 'United University',
            profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            isVerified: true
          };
          localStorage.setItem('parvarish_user_session', JSON.stringify(hodUser));
          setUser(hodUser);
        } else {
          throw new Error('Invalid passcode. Access denied. Please ensure you have authorized HOD / Admin credentials.');
        }
      }
      setPendingAdminVerify(false);
      setIsSelectingRole(false);
      setIsSettingUpProfile(false);
    } catch (err) {
      const errMsg = err.message || 'Invalid passcode. Access denied.';
      setAuthError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Profile setup completion
  const completeProfileSetup = (updatedProfile) => {
    setUser(prev => ({
      ...prev,
      name: updatedProfile.name || prev?.name,
      department: updatedProfile.department || prev?.department,
      designation: updatedProfile.designation || prev?.designation,
      bio: updatedProfile.bio || prev?.bio,
      profileImage: updatedProfile.profileImage || prev?.profileImage
    }));
    setIsSettingUpProfile(false);
  };

  const goBackToRoleSelect = () => {
    setIsSettingUpProfile(false);
    setIsSelectingRole(true);
  };

  const cancelAdminVerify = () => {
    setPendingAdminVerify(false);
    setIsSelectingRole(true);
    setAuthError(null);
  };

  const logout = async () => {
    localStorage.removeItem('parvarish_token');
    localStorage.removeItem('parvarish_remember_me');
    localStorage.removeItem('parvarish_user_session');
    setToken(null);
    setUser(null);
    setIsSelectingRole(false);
    setPendingAdminVerify(false);
    setAuthError(null);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out warning:', err.message);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      authError,
      setAuthError,
      pendingAdminVerify,
      isSelectingRole,
      setIsSelectingRole,
      isSettingUpProfile,
      setIsSettingUpProfile,
      completeProfileSetup,
      goBackToRoleSelect,
      isAuthenticated: Boolean(user),
      loginWithUniversityEmail,
      loginWithGoogle,
      selectRole,
      verifyAdmin,
      cancelAdminVerify,
      logout,
      isSupabaseConfigured,
      profileData,
      updateProfileData
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
