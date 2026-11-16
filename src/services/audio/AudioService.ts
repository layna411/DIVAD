import { Language } from '../../types';

export interface AudioPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  volume: number; // 0 to 1
  language: Language;
  currentText: string | null;
}

export type AudioStateListener = (state: AudioPlaybackState) => void;

class AudioServiceEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private state: AudioPlaybackState = {
    isPlaying: false,
    isPaused: false,
    isMuted: false,
    volume: 1.0,
    language: 'en',
    currentText: null,
  };
  private listeners: Set<AudioStateListener> = new Set();
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.availableVoices = this.synth.getVoices();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.availableVoices.length === 0 && this.synth) {
      this.availableVoices = this.synth.getVoices();
    }
    return this.availableVoices;
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const copy = { ...this.state };
    this.listeners.forEach((l) => l(copy));
  }

  public setVolume(volume: number) {
    this.state.volume = Math.max(0, Math.min(1, volume));
    this.notify();
  }

  public setMuted(muted: boolean) {
    this.state.isMuted = muted;
    if (muted && this.synth) {
      this.synth.cancel();
      this.state.isPlaying = false;
      this.state.isPaused = false;
    }
    this.notify();
  }

  public setLanguage(lang: Language) {
    this.state.language = lang;
    this.notify();
  }

  public speak(text: string, lang?: Language) {
    if (!this.synth || this.state.isMuted) {
      this.state.currentText = text;
      this.notify();
      return;
    }

    // Cancel any active utterance
    this.stop();

    const targetLang = lang || this.state.language;
    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    utterance.volume = this.state.volume;
    utterance.rate = 0.92; // slightly slower for clear child comprehension
    utterance.pitch = 1.05; // warm, friendly

    const voice = this.selectBestVoice(targetLang);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = targetLang === 'ta' ? 'ta-IN' : 'en-US';
    }

    utterance.onstart = () => {
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.state.currentText = text;
      this.notify();
    };

    utterance.onend = () => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        console.warn('[AudioService] Speech error:', e);
      }
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.currentUtterance = null;
      this.notify();
    };

    try {
      this.synth.speak(utterance);
    } catch (err) {
      console.warn('[AudioService] Failed to speak:', err);
    }
  }

  public pause() {
    if (this.synth && this.state.isPlaying) {
      this.synth.pause();
      this.state.isPaused = true;
      this.state.isPlaying = false;
      this.notify();
    }
  }

  public resume() {
    if (this.synth && this.state.isPaused) {
      this.synth.resume();
      this.state.isPaused = false;
      this.state.isPlaying = true;
      this.notify();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.currentUtterance = null;
      this.notify();
    }
  }

  public repeat() {
    if (this.state.currentText) {
      this.speak(this.state.currentText);
    }
  }

  private selectBestVoice(lang: Language): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (lang === 'ta') {
      // Look for Tamil voices (ta, ta-IN, ta-LK, ta-SG, etc.)
      const tamilVoice = voices.find(
        (v) => v.lang.toLowerCase().startsWith('ta') || v.name.toLowerCase().includes('tamil')
      );
      if (tamilVoice) return tamilVoice;
    }

    // Default to clear English natural voice
    const preferredEnglish = voices.find(
      (v) =>
        (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Female')))
    ) || voices.find((v) => v.lang.startsWith('en'));

    return preferredEnglish || null;
  }
}

export const audioService = new AudioServiceEngine();

