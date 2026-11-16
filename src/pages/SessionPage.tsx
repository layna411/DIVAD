import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../contexts/SessionContext';
import { ACTIVITIES_DATA } from '../data/activitiesData';
import { ASSISTANCE_LEVELS, AssistanceLevel } from '../types';
import { InstructionVisualizer } from '../components/instructions/InstructionVisualizer';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  StopCircle,
  Star,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Award,
  Sparkles,
} from 'lucide-react';
import { soundEffects } from '../services/audio/SoundEffects';
import { audioService } from '../services/audio/AudioService';

export const SessionPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSession,
    currentActivityIndex,
    currentStepIndex,
    currentAssistanceLevel,
    language,
    feedback,
    showCelebration,
    sessionDuration,
    isPaused,
    setLanguage,
    setAssistanceLevel,
    pauseSession,
    resumeSession,
    stopSession,
    resetCurrentActivity,
    nextStep,
    previousStep,
    jumpToStep,
    repeatInstructionAudio,
    closeCelebration,
  } = useSession();

  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // If no session is active, navigate back to selection
  useEffect(() => {
    if (!currentSession) {
      navigate('/activities');
    }
  }, [currentSession, navigate]);

  if (!currentSession) return null;

  const currentActivityId = currentSession.selectedActivities[currentActivityIndex];
  const activity = ACTIVITIES_DATA.find((a) => a.id === currentActivityId);
  if (!activity) return null;

  const step = activity.steps[currentStepIndex];
  if (!step) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMuteToggle = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    audioService.setMuted(nextMuted);
    soundEffects.setMuted(nextMuted);
  };

  const handleStopSession = () => {
    if (window.confirm('Do you want to conclude this dressing session?')) {
      stopSession();
      navigate('/activities');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between p-3 sm:p-5 md:p-6 font-sans">
      {/* Top Header / Control HUD */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-3 bg-white/95 backdrop-blur rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200">
        {/* Activity & Physical Section Badge */}
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-slate-900 shadow-sm"
            style={{ backgroundColor: activity.hexColor }}
          >
            {activity.sectionNumber}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                {language === 'ta' ? activity.titleTamil : activity.title}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {activity.hardwareSection.split('–')[0]}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {language === 'ta' ? 'செயல்பாடு' : 'Activity'} {currentActivityIndex + 1} /{' '}
              {currentSession.selectedActivities.length}
            </p>
          </div>
        </div>

        {/* Center Stats: Timer & Stars */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shadow-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>{currentSession.totalStars}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-mono font-bold">
            <span>⏱️ {formatTime(sessionDuration)}</span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Audio Controls */}
          <button
            onClick={repeatInstructionAudio}
            className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold transition"
            title="Repeat Spoken Instruction"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleMuteToggle}
            className={`p-2 rounded-xl transition ${
              isAudioMuted
                ? 'bg-rose-100 text-rose-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Language Toggle */}
          <div className="bg-slate-100 rounded-xl p-0.5 flex text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition ${
                language === 'en' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2 py-1 rounded-lg transition ${
                language === 'ta' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Pause / Resume */}
          <button
            onClick={isPaused ? resumeSession : pauseSession}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title={isPaused ? 'Resume Session' : 'Pause Session'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-slate-700" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Stop / Finish */}
          <button
            onClick={handleStopSession}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
            title="End Session"
          >
            <StopCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Instruction Stage */}
      <div className="max-w-6xl w-full mx-auto my-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Animated Visual Demonstration Engine (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          {/* Step Progression Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-3 mb-2 border-b border-slate-100">
            {activity.steps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => jumpToStep(idx)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1 ${
                  idx === currentStepIndex
                    ? 'bg-amber-500 text-white shadow'
                    : idx < currentStepIndex
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                <span>
                  {language === 'ta' ? 'படி' : 'Step'} {s.stepNumber}
                </span>
                {idx < currentStepIndex && <CheckCircle className="w-3 h-3 text-emerald-600" />}
              </button>
            ))}
          </div>

          {/* Visual Demonstration Canvas */}
          <div className="relative my-2">
            <InstructionVisualizer
              activityId={activity.id}
              stepNumber={step.stepNumber}
              demoGraphic={step.demoGraphic}
            />

            {/* Action Area Prompt Highlight Badge */}
            <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-xs font-bold text-slate-800">
                {language === 'ta' ? step.actionAreaPromptTamil : step.actionAreaPrompt}
              </p>
            </div>
          </div>

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={previousStep}
              disabled={currentStepIndex === 0}
              className="flex items-center space-x-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-30 transition"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{language === 'ta' ? 'முந்தைய படி' : 'Previous'}</span>
            </button>

            <button
              onClick={resetCurrentActivity}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 transition"
              title="Reset Current Activity"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={nextStep}
              className="flex items-center space-x-1 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition"
            >
              <span>
                {currentStepIndex === activity.steps.length - 1
                  ? language === 'ta'
                    ? 'முடிக்கவும்'
                    : 'Complete'
                  : language === 'ta'
                  ? 'அடுத்த படி'
                  : 'Next Step'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Instruction Text, Audio, Assistance Level, Feedback (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Main Instruction Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide bg-amber-100 text-amber-800">
                {language === 'ta' ? `படி ${step.stepNumber} / ${activity.steps.length}` : `Step ${step.stepNumber} of ${activity.steps.length}`}
              </span>

              {step.expectedEvent && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  ⚡ {step.expectedEvent}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-800 leading-snug">
                {language === 'ta' ? step.titleTamil : step.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                {language === 'ta' ? step.descriptionTamil : step.description}
              </p>
            </div>

            {/* Helpful Hint Callout */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start space-x-2.5">
              <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-900 font-semibold leading-relaxed">
                {language === 'ta' ? step.hintTamil : step.hint}
              </p>
            </div>

            {/* Real-time Sensor Feedback Callout */}
            {feedback.type !== 'idle' && (
              <div
                className={`p-3.5 rounded-2xl border flex items-start space-x-2.5 animate-bounce-gentle ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold">
                    {feedback.type === 'success'
                      ? language === 'ta'
                        ? 'அருமை! சரியாக செய்தீர்கள்!'
                        : 'Excellent! Action detected!'
                      : language === 'ta'
                      ? 'மீண்டும் முயற்சி செய்யுங்கள்'
                      : 'Gentle Prompt:'}
                  </div>
                  <div className="text-xs font-medium">
                    {language === 'ta' ? feedback.messageTa : feedback.messageEn}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Therapist Assistance Level Bar (Section 10) */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">
                {language === 'ta' ? 'உதவி நிலை (Assistance Level)' : 'Assistance Level Recorded:'}
              </span>
              <span className="font-bold text-amber-600">
                Level {currentAssistanceLevel}: {ASSISTANCE_LEVELS[currentAssistanceLevel].label}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {([1, 2, 3, 4] as AssistanceLevel[]).map((lvl) => {
                const info = ASSISTANCE_LEVELS[lvl];
                const isActive = currentAssistanceLevel === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => setAssistanceLevel(lvl)}
                    className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition text-center ${
                      isActive
                        ? `${info.color} ring-2 ring-amber-400 font-extrabold shadow-sm`
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div>Lvl {lvl}</div>
                    <div className="truncate text-[9px] font-normal">{info.label}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Modal (Section 14 & 15) */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-400 text-center space-y-5 animate-scale-up">
            <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto flex items-center justify-center animate-bounce">
              <Award className="w-12 h-12 text-amber-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {language === 'ta' ? 'அற்புதம்! முடித்துவிட்டீர்கள்!' : 'CONGRATULATIONS!'}
              </h3>
              <p className="text-sm font-semibold text-amber-700">
                {language === 'ta'
                  ? `${activity.titleTamil} வெற்றிகரமாக முடிந்தது!`
                  : `You mastered the ${activity.title}!`}
              </p>
            </div>

            {/* Stars Award */}
            <div className="flex items-center justify-center space-x-2 py-2">
              {[1, 2, 3].map((s) => (
                <Star key={s} className="w-8 h-8 fill-amber-400 text-amber-500 animate-pulse" />
              ))}
            </div>

            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              {language === 'ta'
                ? 'சிறப்பான முயற்சி! தொடர்ந்து அடுத்த செயல்பாட்டிற்கு செல்வோம்.'
                : 'Awesome independence skills! Ready for the next activity?'}
            </p>

            <button
              onClick={closeCelebration}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-base shadow-lg transition transform hover:scale-[1.02] active:scale-95"
            >
              {language === 'ta' ? 'அடுத்து தொடரவும்' : 'CONTINUE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

