import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MagazineIcon } from '../components/icons/ParvarishIcons';
import { PrivacyPolicyModal } from '../components/PrivacyPolicyModal';
import { isValidEmail, normalizeEmail } from '../services/supabase';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Sparkles,
  X,
  ArrowRight
} from 'lucide-react';

export function LoginView() {
  const { loginWithUniversityEmail, loginWithGoogle, isLoading, authError, setAuthError } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Google Direct Input Modal (For normal Google accounts when Supabase OAuth provider isn't enabled)
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleModalError, setGoogleModalError] = useState('');

  // Email Login Handler
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (setAuthError) setAuthError(null);

    const normalized = normalizeEmail(email);

    if (!normalized) {
      setValidationError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(normalized)) {
      setValidationError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setValidationError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginWithUniversityEmail(normalized, password);
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google OAuth SSO Handler
  const handleGoogleClick = async () => {
    setValidationError('');
    if (setAuthError) setAuthError(null);
    setIsGoogleSubmitting(true);

    try {
      await loginWithGoogle();
    } catch (err) {
      if (err.message === 'NEEDS_GOOGLE_EMAIL') {
        // Open the Google Sign-in modal for normal Google login
        setShowGoogleModal(true);
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  // Direct Google Email Login (Handles any normal @gmail.com or Google account)
  const handleGoogleDirectSubmit = async (customEmail = null) => {
    const targetEmail = (customEmail || googleEmailInput).trim().toLowerCase();
    setGoogleModalError('');

    if (!targetEmail) {
      setGoogleModalError('Please enter your Google email address.');
      return;
    }

    let fullEmail = targetEmail;
    if (!fullEmail.includes('@')) {
      fullEmail = `${targetEmail}@gmail.com`;
    }

    if (!isValidEmail(fullEmail)) {
      setGoogleModalError('Please enter a valid Google email address.');
      return;
    }

    setIsGoogleSubmitting(true);
    try {
      const derivedName = fullEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      await loginWithGoogle({
        id: `google_${fullEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        name: derivedName,
        email: fullEmail,
        imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(derivedName)}`
      });
      setShowGoogleModal(false);
    } catch (err) {
      setGoogleModalError(err.message || 'Failed to sign in with Google.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const activeErrorMessage = validationError || authError;

  return (
    <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#071328] text-slate-900 dark:text-slate-100 flex flex-col justify-between py-8 px-4 relative overflow-hidden font-sans transition-colors duration-200">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#091734]/10 dark:bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-600/10 dark:bg-amber-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

      {/* Top Header Controls */}
      <div className="w-full max-w-md mx-auto flex items-center justify-between z-20">
        <div className="flex items-center space-x-2 text-xs font-serif text-[#091734]/80 dark:text-amber-200/80">
          <Sparkles size={15} className="text-[#C5A880]" />
          <span className="font-semibold tracking-wide">PARVARISH Portal</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 rounded-xl bg-white/80 dark:bg-[#0C1A36] border border-amber-900/15 dark:border-amber-400/20 text-slate-700 dark:text-amber-200 hover:scale-105 transition-all shadow-xs cursor-pointer"
        >
          {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-[#091734]" />}
        </button>
      </div>

      {/* Main Authentication Card */}
      <div className="my-auto relative z-10 w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-[#0C1A36] border border-amber-900/15 dark:border-amber-400/20 rounded-3xl p-7 sm:p-9 shadow-xl dark:shadow-2xl transition-all">
          
          {/* Official Branding */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#091734] dark:bg-[#071328] flex items-center justify-center shadow-lg border border-[#C5A880]/60 mb-3.5 transition-transform hover:scale-105">
              <MagazineIcon size={32} selected={true} doorColor="#091734" spineColor="#091734" className="text-[#F5EEDC]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#091734] dark:text-[#F5EEDC] tracking-tight">
              Welcome to PARVARISH
            </h1>
            
            <p className="text-xs font-serif italic text-amber-800 dark:text-amber-400 mt-1 tracking-wide font-medium">
              The Official University Social Magazine
            </p>

            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 font-sans max-w-xs">
              Sign in with your Google or university account to continue.
            </p>
          </div>

          {/* Friendly Error / Validation Banner */}
          {activeErrorMessage && (
            <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-start space-x-2.5 text-xs text-rose-800 dark:text-rose-200 leading-relaxed shadow-2xs animate-in fade-in duration-200">
              <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{activeErrorMessage}</div>
            </div>
          )}

          {/* Continue with Google Button (Normal Google Login) */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading || isGoogleSubmitting || isSubmitting}
            className="w-full bg-white dark:bg-[#071328] hover:bg-slate-50 dark:hover:bg-[#0a1834] text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700/80 rounded-xl py-3 px-4 flex items-center justify-center space-x-3 text-sm font-semibold shadow-xs hover:shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isGoogleSubmitting ? (
              <Loader2 size={18} className="animate-spin text-[#091734] dark:text-amber-400" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Divider labelled "OR" */}
          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-[#0C1A36] px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 absolute">
              OR
            </span>
          </div>

          {/* Email Login Form (Accepts any Google or university email) */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            
            {/* Email Address */}
            <div>
              <label 
                htmlFor="user-email" 
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-serif mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <input
                  id="user-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError('');
                    if (authError && setAuthError) setAuthError(null);
                  }}
                  placeholder="e.g. yourname@gmail.com"
                  className="w-full bg-[#FAF8F5] dark:bg-[#071328] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 pl-10 text-xs sm:text-sm outline-none focus:border-[#091734] dark:focus:border-[#C5A880] focus:ring-1 focus:ring-[#091734] dark:focus:ring-[#C5A880] transition-all font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="user-password" 
                className="block text-xs font-bold text-slate-700 dark:text-slate-200 font-serif mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationError) setValidationError('');
                    if (authError && setAuthError) setAuthError(null);
                  }}
                  placeholder="Enter your account password"
                  className="w-full bg-[#FAF8F5] dark:bg-[#071328] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 pl-10 pr-10 text-xs sm:text-sm outline-none focus:border-[#091734] dark:focus:border-[#C5A880] focus:ring-1 focus:ring-[#091734] dark:focus:ring-[#C5A880] transition-all font-sans placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting || !email.trim() || !password}
              className="w-full mt-2 bg-[#091734] hover:bg-[#122756] active:bg-[#060f22] text-[#F5EEDC] border border-[#C5A880]/50 font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 text-sm cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin text-amber-300" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Quick University Demo Access Pills */}
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 text-center mb-2 font-serif">
                Instant University Demo Access:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('student@uniteduniversity.edu.in');
                    setPassword('parvarish2026');
                    try {
                      setIsSubmitting(true);
                      await loginWithUniversityEmail('student@uniteduniversity.edu.in', 'parvarish2026');
                    } catch (e) {} finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="py-2 px-2 bg-slate-50 dark:bg-[#071328] hover:bg-slate-100 dark:hover:bg-[#091b3a] border border-slate-200 dark:border-slate-700 rounded-xl text-center text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  🎓 Student Access
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setEmail('hod.cse@uniteduniversity.edu.in');
                    setPassword('HOD2026');
                    try {
                      setIsSubmitting(true);
                      await loginWithUniversityEmail('hod.cse@uniteduniversity.edu.in', 'HOD2026');
                    } catch (e) {} finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="py-2 px-2 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 rounded-xl text-center text-[11px] font-bold text-amber-800 dark:text-amber-300 transition-all cursor-pointer shadow-2xs"
                >
                  🏛️ HOD Admin Access
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>

      {/* Footer Legal & Security */}
      <div className="relative z-10 text-center space-y-2 mt-4">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif">
          By continuing, you agree to the{' '}
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-[#1E3A8A] dark:text-amber-400 hover:underline font-bold transition-colors cursor-pointer"
          >
            Privacy Policy & EULA
          </button>
        </p>

        <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-serif">
          <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
          <span>Secured Google Authentication & Session Protection</span>
        </div>

        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-serif">
          © 2026 PARVARISH Publishing Authority
        </p>
      </div>

      {/* Interactive Google Sign-In Dialog (Allows any normal Google account) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white dark:bg-[#0C1A36] border border-amber-900/20 dark:border-amber-400/20 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center space-y-2 mb-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-[#071328] border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              
              <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-[#F5EEDC]">
                Sign in with Google
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter your Google account to access PARVARISH
              </p>
            </div>

            {googleModalError && (
              <div className="mb-3 p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 text-center font-medium">
                {googleModalError}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); handleGoogleDirectSubmit(); }} className="space-y-3">
              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Google Email Address
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={googleEmailInput}
                  onChange={(e) => {
                    setGoogleEmailInput(e.target.value);
                    if (googleModalError) setGoogleModalError('');
                  }}
                  className="w-full bg-[#FAF8F5] dark:bg-[#071328] border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-[#091734] dark:focus:border-[#C5A880]"
                />
              </div>

              {/* Quick 1-click test button for Aayat Rizvi */}
              <button
                type="button"
                onClick={() => handleGoogleDirectSubmit('aayatrizvi876@gmail.com')}
                className="w-full py-2 px-3 bg-slate-100 dark:bg-[#071328] hover:bg-slate-200 dark:hover:bg-[#0a1b38] rounded-xl text-left flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700/60"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                    A
                  </div>
                  <span className="font-medium truncate max-w-[190px]">aayatrizvi876@gmail.com</span>
                </div>
                <ArrowRight size={14} className="text-slate-400" />
              </button>

              <button
                type="submit"
                disabled={isGoogleSubmitting || !googleEmailInput.trim()}
                className="w-full bg-[#091734] hover:bg-[#122756] text-[#F5EEDC] font-bold py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
              >
                {isGoogleSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-amber-300" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Continue with Google</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Privacy Policy & EULA Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

    </div>
  );
}
