import { useState, useCallback } from 'react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import LanguageSelector from './LanguageSelector';

/**
 * A beautiful voice-input overlay that replaces the chat input
 * while the user is recording.
 *
 * Renders: language selector → mic button → animated waveform → live transcript
 */
function VoiceInput({ onTranscript, disabled }) {
  const [lang, setLang] = useState('hi-IN');
  const [showPanel, setShowPanel] = useState(false);

  const handleResult = useCallback(
    (text) => {
      onTranscript?.(text);
      setShowPanel(false);
    },
    [onTranscript],
  );

  const { isSupported, isListening, interimText, error, startListening, stopListening } =
    useVoiceInput({ onResult: handleResult, lang });

  // Graceful degradation — show a disabled mic button with a tooltip
  if (!isSupported) {
    return (
      <button
        disabled
        title="Voice input requires a Chromium-based browser (Chrome, Edge, Opera)"
        className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-gray-200 text-gray-400 cursor-not-allowed opacity-60"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </button>
    );
  }

  if (!showPanel) {
    // Collapsed state — just the mic button
    return (
      <button
        onClick={() => setShowPanel(true)}
        disabled={disabled}
        title="Speak your answer"
        className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {/* Outer glow */}
        <span className="absolute inset-0 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-30 blur-md transition-opacity" />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
      </button>
    );
  }

  // Expanded panel — recording UI
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-4 border border-indigo-100 shadow-inner space-y-3 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎤</span>
          <span className="text-sm font-semibold text-indigo-800">
            Speak for Justice
          </span>
        </div>
        <button
          onClick={() => {
            stopListening();
            setShowPanel(false);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors text-xs px-2 py-1 rounded-md hover:bg-white/60"
        >
          ✕ Close
        </button>
      </div>

      {/* Language selector */}
      <LanguageSelector selectedLang={lang} onSelect={setLang} />

      {/* Mic button + waveform area */}
      <div className="flex flex-col items-center gap-3 py-2">
        {isListening ? (
          <>
            {/* Animated waveform bars */}
            <div className="flex items-end gap-1 h-12">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-full animate-voice-bar"
                  style={{
                    animationDelay: `${i * 0.07}s`,
                    height: '4px',
                  }}
                />
              ))}
            </div>

            {/* Live transcript */}
            {interimText && (
              <p className="text-sm text-indigo-700 italic text-center max-w-xs animate-fade-in">
                "{interimText}"
              </p>
            )}

            {/* Stop button */}
            <button
              onClick={stopListening}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium shadow-lg shadow-red-200 hover:shadow-xl transition-all duration-200"
            >
              <span className="w-3 h-3 bg-white rounded-sm" />
              Stop Recording
            </button>

            <p className="text-xs text-indigo-400 animate-pulse">
              Listening…
            </p>
          </>
        ) : (
          <>
            {/* Big start button */}
            <button
              onClick={startListening}
              disabled={disabled}
              className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-40"
            >
              {/* Pulse rings */}
              <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-20" />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
            <p className="text-xs text-gray-500">
              Tap to start recording
            </p>
          </>
        )}

        {/* Error display */}
        {error && (
          <p className="text-xs text-red-500 text-center bg-red-50 px-3 py-1.5 rounded-lg">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default VoiceInput;
