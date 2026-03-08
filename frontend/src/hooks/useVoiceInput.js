import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Supported Indian languages for speech recognition.
 * BCP-47 locale → display label.
 */
export const VOICE_LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी', labelEn: 'Hindi' },
  { code: 'en-IN', label: 'English', labelEn: 'English' },
  { code: 'bn-IN', label: 'বাংলা', labelEn: 'Bengali' },
  { code: 'ta-IN', label: 'தமிழ்', labelEn: 'Tamil' },
  { code: 'te-IN', label: 'తెలుగు', labelEn: 'Telugu' },
  { code: 'mr-IN', label: 'मराठी', labelEn: 'Marathi' },
  { code: 'gu-IN', label: 'ગુજરાતી', labelEn: 'Gujarati' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ', labelEn: 'Kannada' },
  { code: 'ml-IN', label: 'മലയാളം', labelEn: 'Malayalam' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ', labelEn: 'Punjabi' },
];

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

/**
 * Hook that wraps the Web Speech Recognition API.
 *
 * @param {object}   opts
 * @param {function} opts.onResult   – called with the final transcript string
 * @param {string}   opts.lang       – BCP-47 language code (default: 'hi-IN')
 */
export function useVoiceInput({ onResult, lang = 'hi-IN' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Store onResult in a ref so the recognition handler always
  // calls the latest version (avoids stale closure).
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const isSupported = Boolean(SpeechRecognition);

  // Tear down on unmount.
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* noop */
        }
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    // If already listening, stop the previous instance first.
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { /* noop */ }
    }

    setError(null);
    setInterimText('');

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setInterimText(interim || final);

      if (final) {
        onResultRef.current?.(final);
        setInterimText('');
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') {
        // User-initiated abort — not an error.
        return;
      }
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone access.');
      } else {
        setError(`Speech error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isSupported,
    isListening,
    interimText,
    error,
    startListening,
    stopListening,
  };
}

