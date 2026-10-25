import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

export function PrivacyPolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#FAF8F5] dark:bg-[#071328] border border-amber-900/20 dark:border-amber-400/20 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#091734] text-[#FFF4DC] flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck size={20} className="text-amber-400" />
            <h3 className="font-serif font-bold text-base tracking-wide">
              PARVARISH — Privacy Policy & EULA
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-amber-200/70 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
          
          {/* Header Banner */}
          <div className="text-center pb-3 border-b border-[#EAE6DF] dark:border-slate-800">
            <h2 className="font-serif font-bold text-lg text-[#091734] dark:text-[#F5EEDC]">
              PARVARISH
            </h2>
            <p className="font-serif italic text-amber-800 dark:text-amber-400 text-xs">
              Privacy Policy & End User License Agreement
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Last Updated: October 25, 2026
            </p>
          </div>

          {/* =========================================================================
              PART I — PRIVACY POLICY
              ========================================================================= */}
          <div className="space-y-4">
            <div className="bg-[#091734] text-[#FFF4DC] px-4 py-2 rounded-xl font-serif font-bold text-xs tracking-wide">
              PART I — PRIVACY POLICY
            </div>

            {/* Section 1 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">1. Introduction</h4>
              <p>
                PARVARISH — The Official University Social Magazine is a university community platform for academic announcements, campus photography, educational videos, and student achievements.
              </p>
              <p>
                This Privacy Policy explains how information may be collected, used, stored, and protected when you use the platform.
              </p>
            </div>

            {/* Section 2 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">2. Information We Collect</h4>
              <p className="text-slate-600 dark:text-slate-400">
                Depending on the features implemented, PARVARISH may process the following information:
              </p>
              <ul className="space-y-1.5 pl-2">
                <li>
                  • <strong className="text-slate-800 dark:text-slate-200">Account information:</strong> Name, official university email address (<span className="text-[#1E3A8A] dark:text-amber-300 font-mono">@uniteduniversity.edu.in</span>), profile picture, biography, university, department, academic year, and account role.
                </li>
                <li>
                  • <strong className="text-slate-800 dark:text-slate-200">User-generated content:</strong> Posts, comments, photographs, and other content submitted through available features.
                </li>
                <li>
                  • <strong className="text-slate-800 dark:text-slate-200">Platform activity:</strong> Bookmarks, following information, and interactions with platform features, where enabled.
                </li>
                <li>
                  • <strong className="text-slate-800 dark:text-slate-200">Technical information:</strong> IP address, browser details, session information, access timestamps, and security logs, where collected.
                </li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">3. How We Use Information</h4>
              <p className="text-slate-600 dark:text-slate-400">Information may be used to:</p>
              <ul className="space-y-1 pl-2">
                <li>• Create and manage user accounts for authenticated university members.</li>
                <li>• Display profiles and academic information.</li>
                <li>• Deliver announcements, photographs, and educational videos.</li>
                <li>• Enforce account permissions and protect administrative functions.</li>
                <li>• Maintain platform security and prevent unauthorized access.</li>
                <li>• Troubleshoot errors and improve performance.</li>
                <li>• Comply with applicable legal obligations.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">4. Visibility of Information</h4>
              <p>
                Names, profile pictures, biographies, academic details, and published content may be visible to other users according to the platform's settings.
              </p>
              <p>
                Email addresses, authentication credentials, and other account-security information should be restricted to authorized systems and personnel.
              </p>
              <p className="text-slate-500 dark:text-slate-400 italic">
                Users should avoid including sensitive personal information in public profiles or posts.
              </p>
            </div>

            {/* Section 5 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">5. Administrator Access</h4>
              <p>
                Only authorized administrators may create, publish, edit, or remove official content, according to their assigned permissions.
              </p>
              <p>
                Students may view published content and use the features available to their accounts. Administrative access must be restricted to authorized personnel and used for legitimate platform purposes.
              </p>
            </div>

            {/* Section 6 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">6. Data Storage and Security</h4>
              <p>
                PARVARISH utilizes Supabase for authentication, secure cloud database management, and row-level security policies.
              </p>
              <p>
                Passwords are authenticated directly via Supabase Auth and are never stored in custom insecure tables or browser local storage.
              </p>
              <p>
                We implement appropriate safeguards, including authentication, role-based access controls, database permissions, and restrictions on file access. However, no electronic system can guarantee absolute security.
              </p>
            </div>

            {/* Section 7 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">7. Third-Party Services</h4>
              <p className="text-slate-600 dark:text-slate-400">
                PARVARISH may use third-party services to provide authentication, storage, video playback, hosting, and other functionality:
              </p>
              <ul className="space-y-1.5 pl-2">
                <li>
                  • <strong className="text-slate-900 dark:text-white">Supabase:</strong> Provides authentication, database management, and file storage.{' '}
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] dark:text-amber-400 hover:underline font-medium">
                    [Privacy Policy]
                  </a>
                </li>
                <li>
                  • <strong className="text-slate-900 dark:text-white">Google OAuth:</strong> Provides single sign-on authentication for verified university domains.{' '}
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] dark:text-amber-400 hover:underline font-medium">
                    [Google Privacy Policy]
                  </a>
                </li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">8. Cookies and Similar Technologies</h4>
              <p>
                Cookies or secure session tokens are used strictly for authentication, session continuity, security, and user preferences.
              </p>
            </div>

            {/* Section 9 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">9. Data Retention and User Rights</h4>
              <p>
                Information will be retained only for as long as reasonably necessary for university community purposes, subject to applicable policies.
              </p>
            </div>

            {/* Section 10 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">10. University Eligibility</h4>
              <p>
                PARVARISH is restricted exclusively to authorized members of United University possessing a valid <span className="font-mono text-[#1E3A8A] dark:text-amber-300">@uniteduniversity.edu.in</span> email account.
              </p>
            </div>

            {/* Section 11 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">11. Changes to This Policy</h4>
              <p>
                This Privacy Policy may be updated when platform features, security configurations, or administrative requirements change.
              </p>
            </div>
          </div>

          {/* =========================================================================
              PART II — END USER LICENSE AGREEMENT (EULA)
              ========================================================================= */}
          <div className="space-y-4 pt-2">
            <div className="bg-[#091734] text-[#FFF4DC] px-4 py-2 rounded-xl font-serif font-bold text-xs tracking-wide">
              PART II — END USER LICENSE AGREEMENT (EULA)
            </div>

            {/* Section 12 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">12. Acceptance of Terms</h4>
              <p>
                By accessing or using PARVARISH, you agree to this agreement and university regulations. If you do not agree, discontinue use immediately.
              </p>
            </div>

            {/* Section 13 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">13. License to Use</h4>
              <p>
                PARVARISH grants verified university users a limited, non-exclusive, non-transferable, and revocable license to use the platform for educational and university community purposes.
              </p>
            </div>

            {/* Section 14 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">14. Account Responsibilities</h4>
              <p>
                Users must provide accurate information, protect login credentials, and immediately report unauthorized access. Accounts must not be shared or used to bypass access controls.
              </p>
            </div>

            {/* Section 15 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">15. Acceptable Use</h4>
              <p>
                Users must adhere strictly to academic codes of conduct. Harassment, unauthorized content modification, security bypassing, and impersonation are strictly forbidden.
              </p>
            </div>

            {/* Section 16 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">16. Intellectual Property</h4>
              <p>
                The PARVARISH name, branding, software, and original platform materials remain the property of their respective owners.
              </p>
            </div>

            {/* Section 17 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">17. Platform Management</h4>
              <p>
                Authorized administrators retain the right to moderate content, suspend access for violations, and maintain platform security.
              </p>
            </div>

            {/* Section 18 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">18. Disclaimer and Limitation</h4>
              <p>
                PARVARISH is provided on an “as available” basis for departmental and university educational communications.
              </p>
            </div>

            {/* Section 19 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">19. Changes to Agreement</h4>
              <p>
                Revisions to this agreement will be published with an updated revision date. Continued usage represents agreement to updated terms.
              </p>
            </div>

            {/* Section 20 */}
            <div className="p-4 bg-white dark:bg-[#0c1a36] rounded-2xl border border-[#EAE6DF] dark:border-slate-800 space-y-1.5">
              <h4 className="font-bold text-slate-900 dark:text-[#F5EEDC] font-serif">20. Governing Law</h4>
              <p>
                This agreement is subject to the rules and regulations of United University and applicable legal jurisdictions.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-[#08152c] border-t border-[#EAE6DF] dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-[#091734] hover:bg-[#15274d] text-[#FFF4DC] px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
}
