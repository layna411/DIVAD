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
      }, 700);
    } catch (e) {
      console.warn('Audio playback notice:', e);
    }

    // 2. Bilingual auditory voice congratulations
    try {
      const speechText =
        language === 'ta'
          ? `அற்புதம்! வாழ்த்துகள்! ${childName ? `${childName}, ` : ''}நீங்கள் இந்த பணியை வெற்றிகரமாக முடித்துவிட்டீர்கள்!`
          : `Congratulations! ${childName ? `${childName}, ` : ''}You successfully completed the task!`;
      audioService.speak(speechText, language);
    } catch (e) {
      console.warn('Speech notice:', e);
    }

    // 3. Multi-wave colorful confetti burst
    const end = Date.now() + 2500;
    const colors = ['#f59e0b', '#38bdf8', '#ec4899', '#10b981', '#8b5cf6'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Center big burst
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors,
    });
  }, [isOpen, language, childName]);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in select-none">
      <div className="relative max-w-xl w-full bg-gradient-to-b from-white via-sky-50/40 to-amber-50/60 rounded-[2.5rem] p-5 sm:p-7 shadow-2xl border-4 border-amber-400 overflow-hidden text-center space-y-4 animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition z-10"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-32 bg-amber-300/40 blur-3xl rounded-full pointer-events-none" />

        {/* The Animated Boy and Girl Celebration Artwork */}
        <div className="relative mx-auto rounded-3xl overflow-hidden shadow-xl border-2 border-amber-300/80 bg-white max-w-lg">
          <img
            src="/congrats-babies.png"
            alt="Animated Baby Boy & Girl - Congrats! Successfully Completed!"
            className="w-full h-auto max-h-64 sm:max-h-72 object-contain mx-auto animate-bounce-cheer animate-rainbow-glow"
          />

          {/* Golden Badge Overlay in bottom corner */}
          <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] shadow-md flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>DIVAD CHAMPION</span>
          </div>
        </div>

        {/* Main Congratulations Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black uppercase tracking-wider">
            <span>🎉 Task Complete</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {language === 'ta' ? 'வாழ்த்துகள்! வெற்றிகரமாக முடிந்தது!' : 'CONGRATS! SUCCESSFULLY COMPLETED!'}
          </h2>

          <p className="text-sm sm:text-base font-bold text-amber-600">
            {language === 'ta'
              ? `${activityTitleTamil} வெற்றிகரமாக முடிந்தது!`
              : `You successfully completed ${activityTitle}!`}
          </p>

          <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
            {language === 'ta'
              ? 'சிறப்பான முயற்சி! நீங்கள் самостояமாக ஆடை அணியும் பயிற்சியை முடித்துவிட்டீர்கள்.'
              : 'Superb independence skills! Both baby friends are celebrating your achievement.'}
          </p>
        </div>

        {/* Star Rating Animation */}
        <div className="flex items-center justify-center space-x-3 py-1">
          {[1, 2, 3].map((starIdx) => (
            <div
              key={starIdx}
              className="relative p-2 rounded-2xl bg-amber-100/80 border border-amber-300 shadow-sm animate-pop-star"
              style={{ animationDelay: `${starIdx * 180}ms` }}
            >
              <Star className="w-8 h-8 sm:w-9 sm:h-9 fill-amber-400 text-amber-500 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center space-x-1.5 border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{language === 'ta' ? 'மீண்டும் செய்ய' : 'Play Again'}</span>
            </button>
          )}

          <button
            onClick={handleContinue}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-black text-sm sm:text-base shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center space-x-2 border-2 border-yellow-200"
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
