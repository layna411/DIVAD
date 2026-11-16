import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { ACTIVITIES_DATA } from '../data/activitiesData';
import { ActivityType } from '../types';
import { Play, CheckCircle2, ArrowLeft, Sparkles, Star, Volume2, Shield } from 'lucide-react';
import { soundEffects } from '../services/audio/SoundEffects';

export const ActivitySelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentChild,
    selectedActivities,
    toggleActivitySelection,
    selectAllActivities,
    startSession,
    language,
    setLanguage,
  } = useSession();

  const handleStart = () => {
    soundEffects.playTap();
    startSession(selectedActivities);
    navigate('/session');
  };

  const handleToggle = (id: ActivityType) => {
    soundEffects.playTap();
    toggleActivitySelection(id);
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col p-4 sm:p-6 md:p-8 font-sans">
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-slate-900 hover:shadow transition"
            title="Back to Welcome"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800">
              {language === 'ta' ? 'DIVAD பயிற்சிப் பலகை' : 'DIVAD Dressing Board'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'ta'
                ? 'பயிற்சி செய்ய விரும்பும் வண்ணப் பகுதியைத் தேர்ந்தெடுக்கவும்'
                : 'Select the matching colored section on your physical board'}
            </p>
          </div>
        </div>

        {/* Child Profile & Language Switcher */}
        <div className="flex items-center space-x-3">
          {currentChild ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-slate-200">
              <span className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center font-bold text-xs text-slate-900">
                {currentChild.name.charAt(0)}
              </span>
              <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                {currentChild.name}
              </span>
            </div>
          ) : (
            <button
              onClick={() => navigate('/therapist')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-sm hover:bg-amber-100 transition"
            >
              <span>+ Enroll Child</span>
            </button>
          )}

          {/* Language Toggle */}
          <div className="bg-white rounded-full p-1 border border-slate-200 shadow-sm flex items-center text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-full transition ${
                language === 'en'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-3 py-1 rounded-full transition ${
                language === 'ta'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              தமிழ்
            </button>
          </div>

          <button
            onClick={() => navigate('/therapist')}
            className="p-2.5 rounded-2xl bg-slate-800 text-slate-200 hover:text-white transition shadow-sm"
            title="Therapist Dashboard"
          >
            <Shield className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Board Layout Preview Notice */}
      <div className="max-w-6xl w-full mx-auto mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>
            {language === 'ta'
              ? 'பலகை அமைப்பைப் போன்ற வண்ண அட்டைகள்:'
              : 'Physical Board Layout Representation:'}
          </span>
        </div>
        <button
          onClick={selectAllActivities}
          className="text-xs font-bold text-sky-600 hover:text-sky-800 transition underline underline-offset-2"
        >
          {language === 'ta' ? 'அனைத்தையும் தேர்ந்தெடு' : 'Select All Fasteners'}
        </button>
      </div>

      {/* Activities Grid Resembling the DIVAD Fabric Board */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {ACTIVITIES_DATA.map((act) => {
          const isSelected = selectedActivities.includes(act.id);

          return (
            <div
              key={act.id}
              onClick={() => handleToggle(act.id)}
              className={`relative rounded-3xl p-6 transition-all duration-300 cursor-pointer border-4 flex flex-col justify-between shadow-md hover:shadow-xl transform hover:-translate-y-1.5 active:scale-[0.98] select-none ${
                isSelected
                  ? `${act.borderColor} ring-4 ring-offset-2 ring-slate-400/40 bg-white`
                  : 'border-slate-200 bg-white/70 opacity-75'
              }`}
              style={{
                borderTopColor: act.hexColor,
                borderTopWidth: '8px',
              }}
            >
              {/* Selection Checkmark Badge */}
              <div className="absolute top-4 right-4">
                {isSelected ? (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md animate-bounce-gentle"
                    style={{ backgroundColor: act.hexColor }}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-slate-300 bg-white/80" />
                )}
              </div>

              {/* Physical Section Tag */}
              <div className="mb-4">
                <span
                  className="inline-block px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm text-slate-900"
                  style={{ backgroundColor: `${act.hexColor}40` }}
                >
                  Section {act.sectionNumber}: {act.colorName.toUpperCase()}
                </span>
              </div>

              {/* Activity Illustration Graphic */}
              <div
                className="w-full h-36 rounded-2xl mb-4 flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner"
                style={{ backgroundColor: `${act.hexColor}15` }}
              >
                {act.id === 'zipper' && (
                  <svg className="w-24 h-24" viewBox="0 0 100 100">
                    <rect x="25" y="10" width="22" height="80" rx="4" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
                    <rect x="53" y="10" width="22" height="80" rx="4" fill="#FDE047" stroke="#CA8A04" strokeWidth="2" />
                    <line x1="50" y1="10" x2="50" y2="90" stroke="#94A3B8" strokeWidth="4" strokeDasharray="3 3" />
                    <rect x="42" y="35" width="16" height="20" rx="3" fill="#CA8A04" stroke="#713F12" strokeWidth="2" />
                  </svg>
                )}

                {act.id === 'button' && (
                  <svg className="w-24 h-24" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="28" fill="#D7CCC8" stroke="#5D4037" strokeWidth="3" />
                    <circle cx="43" cy="45" r="3" fill="#4E342E" />
                    <circle cx="57" cy="45" r="3" fill="#4E342E" />
                    <circle cx="43" cy="55" r="3" fill="#4E342E" />
                    <circle cx="57" cy="55" r="3" fill="#4E342E" />
                    <rect x="75" y="38" width="5" height="24" rx="2" fill="#5D4037" />
                  </svg>
                )}

                {act.id === 'buckle' && (
                  <svg className="w-24 h-24" viewBox="0 0 100 100">
                    <rect x="15" y="36" width="30" height="28" rx="4" fill="#0369A1" />
                    <rect x="45" y="32" width="40" height="36" rx="4" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
                    <circle cx="65" cy="50" r="4" fill="#38BDF8" />
                  </svg>
                )}

                {act.id === 'snap' && (
                  <svg className="w-24 h-24" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="28" fill="#F472B6" stroke="#DB2777" strokeWidth="3" />
                    <circle cx="50" cy="50" r="16" fill="#CBD5E1" stroke="#64748B" strokeWidth="2" />
                    <circle cx="50" cy="50" r="8" fill="#475569" />
                  </svg>
                )}

                {act.id === 'velcro' && (
                  <svg className="w-24 h-24" viewBox="0 0 100 100">
                    <rect x="20" y="30" width="60" height="20" rx="4" fill="#15803D" stroke="#14532D" strokeWidth="2" />
                    <rect x="20" y="52" width="60" height="20" rx="4" fill="#22C55E" stroke="#16A34A" strokeWidth="2" />
                  </svg>
                )}

                {act.id === 'red_fastener' && (
                  <svg className="w-24 h-24" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="30" fill="#F87171" stroke="#DC2626" strokeWidth="3" />
                    <text x="50" y="55" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="bold">
                      ⭐
                    </text>
                  </svg>
                )}
              </div>

              {/* Title and Description */}
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-black text-slate-800">
                  {language === 'ta' ? act.titleTamil : act.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {language === 'ta' ? act.descriptionTamil : act.description}
                </p>
              </div>

              {/* Steps count pill */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{act.steps.length} {language === 'ta' ? 'படிகள்' : 'steps'}</span>
                <span className="text-[11px] text-amber-600 font-bold">
                  {act.hardwareSection.split('–')[1] || act.hardwareSection}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Bar with Large Start Button */}
      <div className="sticky bottom-4 max-w-4xl w-full mx-auto p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 flex items-center justify-between gap-4 z-40">
        <div className="text-xs text-slate-600 font-semibold pl-2">
          <span className="text-amber-500 font-black text-sm">{selectedActivities.length}</span>{' '}
          {language === 'ta' ? 'செயல்பாடுகள் தேர்வு செய்யப்பட்டுள்ளது' : 'fastener activities selected'}
        </div>

        <button
          onClick={handleStart}
          disabled={selectedActivities.length === 0}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-base shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] active:scale-95 disabled:opacity-40 flex items-center space-x-2 border-b-2 border-amber-600"
        >
          <Play className="w-5 h-5 fill-slate-950" />
          <span>{language === 'ta' ? 'பயிற்சியைத் தொடங்கு' : 'START SESSION'}</span>
        </button>
      </div>
    </div>
  );
};

