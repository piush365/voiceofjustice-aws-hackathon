import VoiceInput from './VoiceInput';

function ChatInput({
  inputMessage,
  isLoading,
  isComplete,
  onChange,
  onKeyDown,
  onSend,
  onGenerateDocument,
  onVoiceTranscript,
}) {
  if (isComplete) {
    return (
      <button
        onClick={onGenerateDocument}
        disabled={isLoading}
        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:opacity-50 transition text-lg"
      >
        {isLoading ? 'Generating...' : '📄 Generate Legal Notice'}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Voice input panel (collapsible) */}
      <VoiceInput onTranscript={onVoiceTranscript} disabled={isLoading} />

      {/* Text input + send */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder="Type or speak your answer..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
        />
        <button
          onClick={() => onSend()}
          disabled={isLoading || !inputMessage.trim()}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatInput;


