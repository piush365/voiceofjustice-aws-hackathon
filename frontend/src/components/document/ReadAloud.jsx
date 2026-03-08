import { useTextToSpeech } from '../../hooks/useTextToSpeech';

const SPEEDS = [
  { value: 0.75, label: '0.75×' },
  { value: 1, label: '1×' },
  { value: 1.25, label: '1.25×' },
  { value: 1.5, label: '1.5×' },
];

function ReadAloud({ text }) {
  const { isSupported, isSpeaking, isPaused, rate, setRate, speak, pause, resume, stop } =
    useTextToSpeech();

  if (!isSupported) return null;

  const handlePlayPause = () => {
    if (!isSpeaking) {
      speak(text, 'en-IN');
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100 mb-4">
      {/* Play / Pause */}
      <button
        onClick={handlePlayPause}
        className={`flex items-center justify-center w-10 h-10 rounded-full text-white shadow-md transition-all duration-200 ${
          isSpeaking && !isPaused
            ? 'bg-amber-500 hover:bg-amber-600'
            : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:shadow-lg hover:scale-105'
        }`}
        title={isSpeaking && !isPaused ? 'Pause' : 'Read Aloud'}
      >
        {isSpeaking && !isPaused ? (
          /* Pause icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          /* Play icon */
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Label */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-indigo-800">
          {isSpeaking
            ? isPaused
              ? '⏸️ Paused'
              : '🔊 Reading aloud…'
            : '🔊 Listen to your notice'}
        </p>
        <p className="text-xs text-gray-500">
          Hear your legal notice read aloud
        </p>
      </div>

      {/* Speed selector */}
      <div className="flex gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s.value}
            onClick={() => setRate(s.value)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
              rate === s.value
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-500 hover:bg-indigo-50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Stop button (only when speaking) */}
      {isSpeaking && (
        <button
          onClick={stop}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Stop"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default ReadAloud;
