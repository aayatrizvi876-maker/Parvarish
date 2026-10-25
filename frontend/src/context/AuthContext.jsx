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

const STORAGE_KEY = 'parvarish_profile_custom_v2';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('parvarish_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [pendingAdminVerify, setPendingAdminVerify] = useState(false);
  const [isSelectingRole, setIsSelectingRole] = useState(false);
  const [isSettingUpProfile, setIsSettingUpProfile] = useState(false);

  // Global Synchronized Profile State (shared across Profile, Settings, and Header)
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      prefix: 'Mr.',
      name: 'Aayat Rizvi',
      bio: 'Exploring ideas, capturing moments, and being a part of the PARVARISH community. 🌙',
      department: 'Computer Science',
      year: '3rd Year',
      university: 'United University',
      avatarType: 'custom_image',
      avatarUrl: '',
      coverUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=85',
      postsCount: 4,
      followersCount: 0,
      followingCount: 0
    };
  });

  const updateProfileData = (updatedFields) => {
    setProfileData(prev => {
      const merged = {
        ...prev,
        ...updatedFields,
        university: 'United University'
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn('Failed to save profile to localStorage:', e);
      }

      setUser(current => {
        if (!current) return current;
        return {
          ...current,
          name: merged.name || current.name,
          department: merged.department || current.department,
          bio: merged.bio || current.bio,
          profileImage: merged.avatarUrl || current.profileImage,
          coverImage: merged.coverUrl || current.coverImage
        };
      });

      // Broadcast update event so all mounted components react immediately
      window.dispatchEvent(new CustomEvent('parvarish_profile_sync', { detail: merged }));
      return merged;
    });
  };

  // Sync profileData when user object changes from backend
  useEffect(() => {
    if (user) {
      setProfileData(prev => {
        const updated = {
          ...prev,
          name: prev.name || user.name || 'Aayat Rizvi',
          department: prev.department || user.department || 'Computer Science',
          avatarUrl: prev.avatarUrl || user.profileImage || '',
          bio: prev.bio || user.bio || ''
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  }, [user]);

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
      const isRemembered = localStorage.getItem('parvarish_remember_me') === 'true';
      const storedToken = localStorage.getItem('parvarish_token');

      if (isRemembered && storedToken) {
        try {
          const data = await api.getMe();
          if (data?.user?.email) {
            if (isMounted) {
              setUser(data.user);
              setToken(storedToken);
            }
          } else {
            localStorage.removeItem('parvarish_token');
            localStorage.removeItem('parvarish_remember_me');
            if (isMounted) {
              setToken(null);
              setUser(null);
            }
          }
        } catch (err) {
          console.warn('Session expired or unreachable:', err.message);
          localStorage.removeItem('parvarish_token');
          localStorage.removeItem('parvarish_remember_me');
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      } else {
        localStorage.removeItem('parvarish_token');
        if (isMounted) {
          setToken(null);
          setUser(null);
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
        setUser(prev => ({
          ...prev,
          role: role,
          designation: role === 'FACULTY' ? 'Faculty Member' : 'Student Member'
        }));
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
        setToken(res.token);
        setUser(res.user);
      } catch (backendErr) {
        // Fallback passcode validation for standalone Netlify deployment
        const cleaned = (verificationCode || '').trim().toUpperCase();
        if (cleaned === 'PARVARISH_HOD_2026' || cleaned === 'HOD2026' || cleaned === 'ADMIN2026') {
          setUser(prev => ({
            ...prev,
            name: prev?.name || 'Head of Department',
            role: 'ADMIN',
            designation: 'Head of Department',
            isVerified: true
          }));
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
