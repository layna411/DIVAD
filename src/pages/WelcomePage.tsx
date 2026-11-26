import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, Shield, Heart, Award, ArrowRight, UserCheck } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { useAuth } from '../contexts/AuthContext';
import { soundEffects } from '../services/audio/SoundEffects';

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentChild, childrenList, language, setLanguage } = useSession();
  const { isAuthenticated, therapist } = useAuth();

  const handleStartChildMode = () => {
    soundEffects.playTap();
    if (!isAuthenticated) {
      navigate('/therapist/login?redirect=/activities');
      return;
    }
    soundEffects.playStarPop();
    if (!currentChild && (!childrenList || childrenList.length === 0)) {
      navigate('/therapist');
    } else {
      navigate('/activities');
    }
  };

  const handleOpenTherapistMode = () => {
    soundEffects.playTap();
    if (!isAuthenticated) {
      navigate('/therapist/login');
    } else {
      navigate('/therapist');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-sky-50 to-pink-50 flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans overflow-x-hidden">
      {/* Top Bar with Language Toggle & Therapist Link */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        {/* Logo and Tagline */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1 shadow-md border border-slate-200/80 transform -rotate-2 hover:rotate-0 transition duration-300 flex items-center justify-center">
            <img src="/logo-icon.png" alt="DIVAD Emblem" className="w-full h-full object-contain rounded-xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">
              DIVAD<span className="text-amber-500">.</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Dressing Independence with Visual & Auditory Device
            </p>
          </div>
        </div>

        {/* Language selector & Therapist Portal button */}
        <div className="flex items-center space-x-3">
          {/* Language Toggle */}
          <div className="bg-white/80 backdrop-blur rounded-full p-1 border border-slate-200 shadow-sm flex items-center text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1.5 rounded-full transition ${
                language === 'en'
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-3 py-1.5 rounded-full transition ${
                language === 'ta'
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>

          {/* Therapist Button */}
          {isAuthenticated ? (
            <button
              onClick={handleOpenTherapistMode}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md transition transform hover:scale-105 active:scale-95"
              title="Signed in therapist portal"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">{therapist?.displayName || 'Therapist Portal'}</span>
              <span className="sm:hidden">Portal</span>
            </button>
          ) : (
            <button
              onClick={handleOpenTherapistMode}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-md transition transform hover:scale-105 active:scale-95"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Therapist Login</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Welcome Hero Section */}
      <div className="max-w-4xl w-full mx-auto my-auto py-8 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
        {/* Mascot Cartoon Character Graphic */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex-shrink-0 flex items-center justify-center">
          {/* Glowing colorful backdrop rings */}
          <div className="absolute w-64 h-64 bg-amber-300/40 rounded-full blur-2xl animate-pulse" />
          <div className="absolute w-52 h-52 bg-pink-300/30 rounded-full blur-xl translate-x-4 -translate-y-4" />

          {/* Friendly Mascot SVG: "Divo" the friendly superhero dressing bear */}
          <svg className="w-full h-full relative z-10 drop-shadow-2xl animate-bounce-gentle" viewBox="0 0 200 200">
            {/* Bear Ears */}
            <circle cx="50" cy="55" r="22" fill="#D97706" stroke="#92400E" strokeWidth="4" />
            <circle cx="50" cy="55" r="12" fill="#FDE68A" />
            <circle cx="150" cy="55" r="22" fill="#D97706" stroke="#92400E" strokeWidth="4" />
            <circle cx="150" cy="55" r="12" fill="#FDE68A" />

            {/* Bear Body / Vest with DIVAD color stripes */}
            <rect x="55" y="105" width="90" height="80" rx="25" fill="#38BDF8" stroke="#0284C7" strokeWidth="4" />
            {/* Yellow Zipper Stripe down center */}
            <line x1="100" y1="110" x2="100" y2="175" stroke="#FDE047" strokeWidth="6" strokeLinecap="round" />
            {/* Zipper Pull Tab */}
            <circle cx="100" cy="130" r="5" fill="#CA8A04" />
            {/* Colorful Buttons */}
            <circle cx="80" cy="140" r="4" fill="#DB2777" />
            <circle cx="80" cy="155" r="4" fill="#16A34A" />

            {/* Bear Head */}
            <circle cx="100" cy="85" r="48" fill="#F59E0B" stroke="#B45309" strokeWidth="4" />

            {/* Snout */}
            <ellipse cx="100" cy="95" rx="22" ry="16" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
            {/* Nose */}
            <ellipse cx="100" cy="88" rx="7" ry="5" fill="#451A03" />
            {/* Happy Smile */}
            <path d="M 94,96 Q 100,104 106,96" fill="none" stroke="#451A03" strokeWidth="3" strokeLinecap="round" />

            {/* Big Friendly Anime Eyes */}
            <ellipse cx="80" cy="76" rx="6" ry="8" fill="#1E293B" />
            <circle cx="82" cy="73" r="2.5" fill="#FFFFFF" />
            <ellipse cx="120" cy="76" rx="6" ry="8" fill="#1E293B" />
            <circle cx="122" cy="73" r="2.5" fill="#FFFFFF" />

            {/* Rosy Cheeks */}
            <circle cx="68" cy="90" r="6" fill="#F87171" opacity="0.6" />
            <circle cx="132" cy="90" r="6" fill="#F87171" opacity="0.6" />

            {/* Waving Hand */}
            <g className="animate-wiggle" style={{ transformOrigin: '160px 120px' }}>
              <ellipse cx="160" cy="120" rx="14" ry="12" fill="#D97706" stroke="#92400E" strokeWidth="3" />
            </g>
          </svg>
        </div>

        {/* Text and Actions */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="flex justify-center md:justify-start">
            <img
              src="/logo.png"
              alt="DIVAD Logo"
              className="h-20 sm:h-24 md:h-28 object-contain hover:scale-[1.02] transition duration-300 drop-shadow-sm"
            />
          </div>

          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>
              {language === 'ta'
                ? 'ஆடைகளை சுயமாக அணிய கற்றுக்கொள்வோம்!'
                : 'Pediatric Dressing Training Device'}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-800 leading-tight">
            {language === 'ta' ? (
              <>
                வணக்கம்! <span className="text-amber-500">DIVAD</span>-க்கு வருக!
              </>
            ) : (
              <>
                Welcome to <span className="text-amber-500">DIVAD</span>!
              </>
            )}
          </h2>

          <p className="text-base sm:text-xl text-slate-600 font-medium leading-relaxed max-w-lg mx-auto md:mx-0">
            {language === 'ta'
              ? 'ஜிப், பொத்தான், பக்கிள், ஸ்நாப் மற்றும் வெல்க்ரோ போன்றவற்றை எளிதாக இணைக்க கற்றுக்கொள்வோம்.'
              : "Let's learn to dress independently with fun step-by-step visual steps, audio guides, and real-time board sensors!"}
          </p>

          {/* Big Start Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
            <button
              onClick={handleStartChildMode}
              className="w-full sm:w-auto px-8 py-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-xl shadow-xl hover:shadow-2xl transition duration-200 transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center space-x-3 group border-b-4 border-amber-600"
            >
              <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-amber-600 group-hover:scale-110 transition">
                <Play className="w-6 h-6 fill-amber-500 text-amber-500 ml-0.5" />
              </div>
              <span>{language === 'ta' ? 'பயிற்சியைத் தொடங்கு!' : "LET'S START!"}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Feature Highlights */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-6 border-t border-slate-200/80">
        <div className="p-2.5 rounded-xl bg-white/60 backdrop-blur border border-slate-200/60">
          <div className="text-xs font-bold text-amber-700">Yellow Section</div>
          <div className="text-[11px] text-slate-500">2 Zippers</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/60 backdrop-blur border border-slate-200/60">
          <div className="text-xs font-bold text-amber-900">Brown Section</div>
          <div className="text-[11px] text-slate-500">3 Buttons</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/60 backdrop-blur border border-slate-200/60">
          <div className="text-xs font-bold text-sky-700">Blue Section</div>
          <div className="text-[11px] text-slate-500">Buckle Fastening</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/60 backdrop-blur border border-slate-200/60">
          <div className="text-xs font-bold text-pink-700">Pink & Green</div>
          <div className="text-[11px] text-slate-500">Snaps & Velcro</div>
        </div>
      </div>
    </div>
  );
};

