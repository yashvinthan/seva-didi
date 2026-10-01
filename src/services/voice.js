import { getLanguageMeta } from '../../shared/languages.js';

let cachedVoices = [];

function refreshVoices() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    cachedVoices = window.speechSynthesis.getVoices() || [];
  }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.onvoiceschanged = refreshVoices;
}

/**
 * Check browser voice and mic capabilities.
 */
export function checkVoiceCapabilities() {
  if (typeof window === 'undefined') {
    return { hasSpeechRecognition: false, hasMediaRecorder: false, hasSynthesis: false, isSecure: false };
  }

  const hasSpeechRecognition = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const hasMediaRecorder = Boolean(window.MediaRecorder && navigator.mediaDevices?.getUserMedia);
  const hasSynthesis = Boolean(window.speechSynthesis);
  const isSecure = window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return { hasSpeechRecognition, hasMediaRecorder, hasSynthesis, isSecure };
}

/**
 * Request microphone permissions explicitly with friendly diagnostic errors.
 */
export async function requestMicrophoneAccess() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    throw new Error('UNSUPPORTED_BROWSER');
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // Stop all audio tracks after verification so mic indicator doesn't stay on
    stream.getTracks().forEach((track) => track.stop());
    return true;
  } catch (error) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      throw new Error('PERMISSION_DENIED');
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      throw new Error('NO_MIC_HARDWARE');
    }
    throw error;
  }
}

/**
 * Create a resilient SpeechRecognition session.
 */
export function createSpeechRecognizer({ lang = 'hi', onResult, onError, onEnd, onStart }) {
  if (typeof window === 'undefined') return null;
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;

  const recognition = new Recognition();
  const meta = getLanguageMeta(lang);
  recognition.lang = meta.speechLocale || 'hi-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;

  recognition.onstart = () => {
    if (onStart) onStart();
  };

  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    if (onResult) onResult(transcript.trim());
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error || 'speech-error');
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}

/**
 * Cross-browser Audio Recorder via MediaRecorder (for Safari, Firefox, and backend AI voice processing)
 */
export class VoiceRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.isRecording = false;
  }

  async start() {
    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : MediaRecorder.isTypeSupported('audio/mp4')
      ? 'audio/mp4'
      : 'audio/wav';

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250);
    this.isRecording = true;
  }

  async stop() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }
        this.isRecording = false;
        resolve({ blob: audioBlob, mimeType });
      };

      this.mediaRecorder.stop();
    });
  }

  cancel() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.isRecording = false;
    this.audioChunks = [];
  }
}

/**
 * Resilient Speech Synthesis for Indian regional languages.
 * Fixes Chrome freeze bug, selects Indian accent voice where available.
 */
export function speakText(text, lang = 'hi', { onStart, onEnd } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    // 1. Unfreeze Chrome synthesis engine if it was paused
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    if (!text || !text.trim()) return;

    const meta = getLanguageMeta(lang);
    const targetLocale = meta.speechLocale || 'hi-IN';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLocale;
    utterance.rate = 0.88; // Slightly measured rate for clear comprehension by rural users
    utterance.pitch = 1.0;

    // 2. Select best matching voice from cached voices
    if (cachedVoices.length === 0) refreshVoices();
    const voice = cachedVoices.find((v) => v.lang === targetLocale || v.lang.replace('_', '-').startsWith(meta.speechLocale.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    // Graceful fallback without crashing
    if (onEnd) onEnd();
  }
}
