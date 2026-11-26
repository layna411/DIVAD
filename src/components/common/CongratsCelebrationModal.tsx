import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Award, Sparkles, X, RotateCcw, ArrowRight } from 'lucide-react';
import { soundEffects } from '../../services/audio/SoundEffects';
import { audioService } from '../../services/audio/AudioService';

export interface CongratsCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  onRetry?: () => void;
  activityTitle?: string;
  activityTitleTamil?: string;
  starsEarned?: number;
  language?: 'en' | 'ta';
  childName?: string;
}

export const CongratsCelebrationModal: React.FC<CongratsCelebrationModalProps> = ({
  isOpen,
  onClose,
  onContinue,
  onRetry,
  activityTitle = 'Dressing Activity',
  activityTitleTamil = 'ஆடை அணியும் செயல்பாடு',
  starsEarned = 3,
  language = 'en',
  childName,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // 1. Play celebration fanfare & chime
    try {
      soundEffects.playCelebrationFanfare();
      setTimeout(() => {
        soundEffects.playSuccessChime();
      }, 650);
    } catch (e) {
      console.warn('Audio playback notice:', e);
    }

    // 2. Bilingual auditory voice congratulations
    try {
      const speechText =
        language === 'ta'
          ? `அற்புதம்! வாழ்த்துகள்! ${childName ? `${childName}, ` : ''}நீங்கள் ${activityTitleTamil} வெற்றிகரமாக முடித்துவிட்டீர்கள்!`
          : `Congratulations! ${childName ? `${childName}, ` : ''}You successfully completed ${activityTitle}!`;
      audioService.speak(speechText, language);
    } catch (e) {
      console.warn('Speech notice:', e);
    }

    // 3. Multi-wave colorful confetti burst from both sides
    const colors = ['#f59e0b', '#38bdf8', '#ec4899', '#10b981', '#8b5cf6', '#fbbf24'];

    // Left cannon
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 70,
      origin: { x: 0.1, y: 0.7 },
      colors,
    });

    // Right cannon
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 70,
      origin: { x: 0.9, y: 0.7 },
      colors,
    });

    // Center burst after slight delay
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors,
      });
    }, 300);
  }, [isOpen, language, childName, activityTitle, activityTitleTamil]);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-lg w-full bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-amber-300 overflow-hidden text-center space-y-4 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition z-20"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Warm Golden Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-24 bg-amber-200/50 blur-3xl rounded-full pointer-events-none" />

        {/* Hero Celebration Animated Artwork */}
        <div className="relative mx-auto rounded-2xl overflow-hidden shadow-lg border border-amber-200 bg-amber-50/30">
          <img
            src="/congrats-babies.png"
            alt="Congrats! Successfully Completed!"
            className="w-full h-auto object-contain mx-auto animate-bounce-cheer"
          />
        </div>

        {/* Personalized Congratulation Details */}
        <div className="space-y-1.5 pt-1">
          <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{language === 'ta' ? 'வெற்றிகரமாக முடிந்தது' : 'Activity Completed'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'ta'
              ? `${activityTitleTamil} முடிந்தது!`
              : `You Mastered ${activityTitle}!`}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-sm mx-auto">
            {language === 'ta'
              ? `${childName ? `${childName}, ` : ''}சிறப்பான முயற்சி! நீங்கள் самостояமாக ஆடை அணியும் பயிற்சியை முடித்துவிட்டீர்கள்.`
              : `Great independence skills${childName ? `, ${childName}` : ''}! You completed all steps successfully.`}
          </p>
        </div>

        {/* Star Rating Popping In */}
        <div className="flex items-center justify-center space-x-2 py-1">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className="p-2 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm animate-pop-star"
              style={{ animationDelay: `${starIdx * 150}ms` }}
            >
              <Star className="w-8 h-8 fill-amber-400 text-amber-500 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-1">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center space-x-1.5 border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'ta' ? 'மீண்டும்' : 'Play Again'}</span>
            </button>
          )}

          <button
            onClick={handleContinue}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-sm sm:text-base shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>{language === 'ta' ? 'அடுத்த செயல்பாடு தொடரவும்' : 'CONTINUE NEXT TASK'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CongratsCelebrationModal;

