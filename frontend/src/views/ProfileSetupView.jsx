import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, ArrowRight, Upload, Camera, User, ArrowLeft } from 'lucide-react';

export function ProfileSetupView({ onComplete }) {
  const { user, completeProfileSetup, goBackToRoleSelect } = useAuth();
  const fileInputRef = useRef(null);
  
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80');

  const avatars = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setProfileImage(uploadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    completeProfileSetup({
      name,
      profileImage
    });
    if (onComplete) onComplete();
  };

  const getRoleBadge = () => {
    if (user?.role === 'ADMIN') return { label: 'Head of Department (HOD)', emoji: '🏛️', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
    if (user?.role === 'FACULTY') return { label: 'Faculty Member', emoji: '👨‍🏫', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
    return { label: 'Student', emoji: '🎓', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
  };

  const roleInfo = getRoleBadge();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 py-12 px-4 flex flex-col justify-between font-sans select-none">
      <div className="max-w-xl mx-auto w-full py-4 space-y-6">
        
        {/* Top Navigation Bar with Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goBackToRoleSelect}
            className="inline-flex items-center space-x-1.5 text-xs text-slate-700 hover:text-[#1E3A8A] font-bold py-1.5 px-3 rounded-full bg-white border border-amber-900/10 shadow-2xs transition-colors active:scale-95"
          >
            <ArrowLeft size={15} />
            <span>Back to Role Selection</span>
          </button>
        </div>

        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white mx-auto shadow-md border border-amber-200 mb-2">
            <BookOpen size={24} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1E3A8A]">
            Set Up Your Profile
          </h2>
          <p className="text-xs text-slate-600 font-serif italic">
            Choose your avatar photo and set your username to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Selected Role Banner */}
          <div className="bg-white p-3.5 rounded-2xl border border-amber-900/10 shadow-2xs flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">{roleInfo.emoji}</span>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Selected Role</span>
                <span className="font-serif font-bold text-xs text-slate-900">{roleInfo.label}</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${roleInfo.bg}`}>
              Verified
            </span>
          </div>

          {/* Option 1: Avatar / Profile Photo Section */}
          <div className="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-2xs text-center space-y-4">
            <span className="text-xs font-bold text-slate-800 font-serif block text-left">Option 1: Profile Avatar</span>
            
            {/* Big Active Avatar Display */}
            <div className="relative w-24 h-24 mx-auto group">
              <img
                src={profileImage}
                alt="Selected Avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-[#1E3A8A] shadow-md"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#1E3A8A] hover:bg-blue-900 text-white p-2 rounded-full shadow-md border-2 border-white transition-transform active:scale-90"
                title="Choose photo from Gallery"
              >
                <Camera size={14} />
              </button>
            </div>

            {/* Hidden File Input for Device Gallery */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Upload Photo Button */}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold px-4 py-2 rounded-full border border-amber-300 transition-colors shadow-2xs"
              >
                <Upload size={14} />
                <span>Upload Photo from Gallery</span>
              </button>
            </div>

            {/* Sample Avatars Options */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-serif italic block mb-2">Or choose a sample avatar:</span>
              <div className="flex justify-center items-center gap-2.5">
                {avatars.map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setProfileImage(imgUrl)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                      profileImage === imgUrl ? 'border-[#1E3A8A] scale-110 ring-2 ring-blue-900/20' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Option 2: Username / Full Name Section */}
          <div className="bg-white p-4 rounded-2xl border border-amber-900/10 shadow-2xs space-y-1.5">
            <label className="text-xs font-bold text-slate-900 font-serif block">Option 2: Username / Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your username or full name"
                className="w-full bg-[#FAF8F5] border border-amber-900/15 text-xs text-slate-900 rounded-xl p-3 pl-9 outline-none focus:border-[#1E3A8A] font-sans font-medium"
              />
              <User size={15} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={!name}
            className="w-full bg-[#1E3A8A] hover:bg-blue-950 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-md transition-all border border-amber-200 active:scale-[0.98] text-xs"
          >
            <span>Save Profile & Enter Parvarish</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
