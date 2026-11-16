import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  ActivitySession,
  ActivityType,
  AssistanceLevel,
  ChildProfile,
  Language,
  SensorEvent,
} from '../types';
import { ACTIVITIES_DATA } from '../data/activitiesData';
import { DataService } from '../services/firebase/dataService';
import { useHardware } from './HardwareContext';
import { SensorValidationEngine } from '../services/validation/SensorValidationEngine';
import { soundEffects } from '../services/audio/SoundEffects';
import { audioService } from '../services/audio/AudioService';
import confetti from 'canvas-confetti';

interface FeedbackState {
  type: 'success' | 'try_again' | 'hint' | 'idle';
  messageEn: string;
  messageTa: string;
  timestamp: number;
}

interface SessionContextType {
  childrenList: ChildProfile[];
  currentChild: ChildProfile | null;
  selectedActivities: ActivityType[];
  currentSession: ActivitySession | null;
  currentActivityIndex: number;
  currentStepIndex: number;
  currentAssistanceLevel: AssistanceLevel;
  language: Language;
  feedback: FeedbackState;
  showCelebration: boolean;
  sessionDuration: number;
  isPaused: boolean;
  stepStartTime: number;

  // Actions
  selectChild: (childId: string) => void;
  toggleActivitySelection: (activity: ActivityType) => void;
  selectAllActivities: () => void;
  setLanguage: (lang: Language) => void;
  setAssistanceLevel: (lvl: AssistanceLevel) => void;
  startSession: (activities?: ActivityType[]) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  resetCurrentActivity: () => void;
  nextStep: () => void;
  previousStep: () => void;
  jumpToStep: (stepIndex: number) => void;
  nextActivity: () => void;
  repeatInstructionAudio: () => void;
  closeCelebration: () => void;
  refreshChildren: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { subscribeToEvents, sendCommand } = useHardware();

  // Child management
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [currentChild, setCurrentChild] = useState<ChildProfile | null>(null);

  // Activity selection
  const [selectedActivities, setSelectedActivities] = useState<ActivityType[]>([
    'zipper',
    'button',
    'buckle',
  ]);

  // Session state
  const [currentSession, setCurrentSession] = useState<ActivitySession | null>(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentAssistanceLevel, setCurrentAssistanceLevelState] = useState<AssistanceLevel>(2);
  const [language, setLanguageState] = useState<Language>('en');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  // Feedback & Celebrations
  const [feedback, setFeedback] = useState<FeedbackState>({
    type: 'idle',
    messageEn: '',
    messageTa: '',
    timestamp: 0,
  });
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // References to keep event handlers fresh without re-subscribing
  const sessionRef = useRef(currentSession);
  sessionRef.current = currentSession;
  const currentActivityIndexRef = useRef(currentActivityIndex);
  currentActivityIndexRef.current = currentActivityIndex;
  const currentStepIndexRef = useRef(currentStepIndex);
  currentStepIndexRef.current = currentStepIndex;
  const assistanceLevelRef = useRef(currentAssistanceLevel);
  assistanceLevelRef.current = currentAssistanceLevel;
  const languageRef = useRef(language);
  languageRef.current = language;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const refreshChildren = useCallback(() => {
    const list = DataService.getChildren();
    setChildrenList(list);
    if (!currentChild && list.length > 0) {
      setCurrentChild(list[0]);
      setCurrentAssistanceLevelState(list[0].baselineAssistanceLevel);
      setLanguageState(list[0].preferredLanguage);
    }
  }, [currentChild]);

  useEffect(() => {
    refreshChildren();
    // Synchronize with remote Firestore if available
    DataService.syncFromFirestore().then(() => {
      refreshChildren();
    });
  }, [refreshChildren]);

  // Session duration timer
  useEffect(() => {
    let timer: any;
    if (currentSession && !isPaused && currentSession.status === 'in-progress') {
      timer = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentSession, isPaused]);

  // Read instruction audio when step or language changes
  const speakCurrentStep = useCallback(
    (actIndex: number, stIndex: number, targetLang: Language) => {
      const actId = sessionRef.current?.selectedActivities[actIndex] || selectedActivities[actIndex];
      const activity = ACTIVITIES_DATA.find((a) => a.id === actId);
      if (!activity) return;

      const step = activity.steps[stIndex];
      if (!step) return;

      const text =
        targetLang === 'ta'
          ? `${step.titleTamil}. ${step.descriptionTamil}`
          : `${step.title}. ${step.description}`;

      audioService.speak(text, targetLang);
    },
    [selectedActivities]
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    audioService.setLanguage(lang);
    if (currentSession) {
      speakCurrentStep(currentActivityIndex, currentStepIndex, lang);
    }
  };

  const setAssistanceLevel = (lvl: AssistanceLevel) => {
    setCurrentAssistanceLevelState(lvl);
  };

  const selectChild = (childId: string) => {
    const child = childrenList.find((c) => c.id === childId);
    if (child) {
      setCurrentChild(child);
      setCurrentAssistanceLevelState(child.baselineAssistanceLevel);
      setLanguageState(child.preferredLanguage);
    }
  };

  const toggleActivitySelection = (activity: ActivityType) => {
    setSelectedActivities((prev) => {
      if (prev.includes(activity)) {
        if (prev.length <= 1) return prev; // Keep at least one selected
        return prev.filter((a) => a !== activity);
      } else {
        return [...prev, activity];
      }
    });
  };

  const selectAllActivities = () => {
    setSelectedActivities(ACTIVITIES_DATA.map((a) => a.id));
  };

  const startSession = (activities?: ActivityType[]) => {
    const acts = activities && activities.length > 0 ? activities : selectedActivities;
    const newSession: ActivitySession = {
      id: `sess_${Date.now()}`,
      childId: currentChild?.id || 'child_1',
      therapistId: 'therapist_dr_sarah',
      startTime: Date.now(),
      status: 'in-progress',
      selectedActivities: acts,
      currentActivityIndex: 0,
      currentStepIndex: 0,
      attempts: [],
      totalStars: 0,
      badgesEarned: [],
      language: language,
    };

    setCurrentSession(newSession);
    setCurrentActivityIndex(0);
    setCurrentStepIndex(0);
    setSessionDuration(0);
    setIsPaused(false);
    setStepStartTime(Date.now());
    setFeedback({ type: 'idle', messageEn: '', messageTa: '', timestamp: 0 });

    soundEffects.playTap();
    speakCurrentStep(0, 0, language);
  };

  const pauseSession = () => {
    setIsPaused(true);
    audioService.pause();
    if (currentSession) {
      const updated = { ...currentSession, status: 'paused' as const };
      setCurrentSession(updated);
      DataService.saveSession(updated);
    }
  };

  const resumeSession = () => {
    setIsPaused(false);
    audioService.resume();
    if (currentSession) {
      const updated = { ...currentSession, status: 'in-progress' as const };
      setCurrentSession(updated);
    }
  };

  const stopSession = () => {
    if (currentSession) {
      const updated: ActivitySession = {
        ...currentSession,
        status: 'completed',
        endTime: Date.now(),
      };
      DataService.saveSession(updated);
      setCurrentSession(null);
      audioService.stop();
    }
  };

  const resetCurrentActivity = () => {
    setCurrentStepIndex(0);
    setStepStartTime(Date.now());
    setFeedback({ type: 'idle', messageEn: '', messageTa: '', timestamp: 0 });
    speakCurrentStep(currentActivityIndex, 0, language);
  };

  const recordAttempt = (isCorrect: boolean, eventType?: any, feedbackNote?: string) => {
    if (!sessionRef.current) return;

    const actId = sessionRef.current.selectedActivities[currentActivityIndexRef.current];
    const durationMs = Date.now() - stepStartTime;

    const attempt = {
      id: `att_${Date.now()}`,
      sessionId: sessionRef.current.id,
      childId: sessionRef.current.childId,
      activityId: actId,
      stepNumber: currentStepIndexRef.current + 1,
      timestamp: Date.now(),
      isCorrect,
      assistanceLevel: assistanceLevelRef.current,
      durationMs,
      sensorEvent: eventType,
      feedbackMessage: feedbackNote,
    };

    const updatedAttempts = [...sessionRef.current.attempts, attempt];
    const updatedStars = isCorrect ? sessionRef.current.totalStars + 1 : sessionRef.current.totalStars;

    const updatedSession: ActivitySession = {
      ...sessionRef.current,
      attempts: updatedAttempts,
      totalStars: updatedStars,
    };

    setCurrentSession(updatedSession);
    DataService.saveSession(updatedSession);
  };

  const nextStep = () => {
    if (!currentSession) return;
    const actId = currentSession.selectedActivities[currentActivityIndex];
    const activity = ACTIVITIES_DATA.find((a) => a.id === actId);
    if (!activity) return;

    if (currentStepIndex < activity.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      setStepStartTime(Date.now());
      speakCurrentStep(currentActivityIndex, nextIdx, language);
    } else {
      // Activity completed!
      handleActivityCompletion();
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      setStepStartTime(Date.now());
      speakCurrentStep(currentActivityIndex, prevIdx, language);
    }
  };

  const jumpToStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    setStepStartTime(Date.now());
    speakCurrentStep(currentActivityIndex, stepIndex, language);
  };

  const handleActivityCompletion = () => {
    if (!currentSession) return;

    soundEffects.playCelebrationFanfare();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    const actId = currentSession.selectedActivities[currentActivityIndex];
    const act = ACTIVITIES_DATA.find((a) => a.id === actId);
    const badgeName = `${act?.title || 'Fastener'} Champion`;

    const updatedBadges = currentSession.badgesEarned.includes(badgeName)
      ? currentSession.badgesEarned
      : [...currentSession.badgesEarned, badgeName];

    const updatedSession: ActivitySession = {
      ...currentSession,
      badgesEarned: updatedBadges,
      totalStars: currentSession.totalStars + 3, // Bonus stars for completion
    };
    setCurrentSession(updatedSession);
    DataService.saveSession(updatedSession);

    setShowCelebration(true);
  };

  const nextActivity = () => {
    setShowCelebration(false);
    if (!currentSession) return;

    if (currentActivityIndex < currentSession.selectedActivities.length - 1) {
      const nextActIdx = currentActivityIndex + 1;
      setCurrentActivityIndex(nextActIdx);
      setCurrentStepIndex(0);
      setStepStartTime(Date.now());
      speakCurrentStep(nextActIdx, 0, language);
    } else {
      // Completed all selected activities in session
      stopSession();
    }
  };

  const repeatInstructionAudio = () => {
    speakCurrentStep(currentActivityIndex, currentStepIndex, language);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    nextActivity();
  };

  // Wire up incoming sensor events with the SensorValidationEngine
  useEffect(() => {
    const unsubscribe = subscribeToEvents((event: SensorEvent) => {
      if (!sessionRef.current || isPausedRef.current) return;

      const actId = sessionRef.current.selectedActivities[currentActivityIndexRef.current];
      const activity = ACTIVITIES_DATA.find((a) => a.id === actId);
      if (!activity) return;

      const currentStep = currentStepIndexRef.current + 1;
      const totalSteps = activity.steps.length;

      const validation = SensorValidationEngine.validate(
        actId,
        currentStep,
        totalSteps,
        event
      );

      if (validation.isValid) {
        soundEffects.playSuccessChime();
        soundEffects.playStarPop();
        setFeedback({
          type: 'success',
          messageEn: validation.messageEn,
          messageTa: validation.messageTa,
          timestamp: Date.now(),
        });

        // Trigger buzzer success on hardware
        sendCommand(0xA1);

        recordAttempt(true, event.event, validation.messageEn);

        // Auto advance step after short delay
        if (validation.isActivityComplete) {
          setTimeout(() => {
            handleActivityCompletion();
          }, 1000);
        } else if (validation.isAdvanceStep) {
          setTimeout(() => {
            nextStep();
          }, 1200);
        }
      } else if (validation.feedbackType === 'warning') {
        soundEffects.playTryAgainTone();
        setFeedback({
          type: 'try_again',
          messageEn: validation.messageEn,
          messageTa: validation.messageTa,
          timestamp: Date.now(),
        });
        sendCommand(0xA2); // Buzzer try again
        recordAttempt(false, event.event, validation.messageEn);
      }
    });

    return () => unsubscribe();
  }, [subscribeToEvents, sendCommand]);

  return (
    <SessionContext.Provider
      value={{
        childrenList,
        currentChild,
        selectedActivities,
        currentSession,
        currentActivityIndex,
        currentStepIndex,
        currentAssistanceLevel,
        language,
        feedback,
        showCelebration,
        sessionDuration,
        isPaused,
        stepStartTime,
        selectChild,
        toggleActivitySelection,
        selectAllActivities,
        setLanguage,
        setAssistanceLevel,
        startSession,
        pauseSession,
        resumeSession,
        stopSession,
        resetCurrentActivity,
        nextStep,
        previousStep,
        jumpToStep,
        nextActivity,
        repeatInstructionAudio,
        closeCelebration,
        refreshChildren,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

