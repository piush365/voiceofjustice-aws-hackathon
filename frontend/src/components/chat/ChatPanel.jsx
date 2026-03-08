import ProgressSummary from './ProgressSummary';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

function ChatPanel({
  messages,
  isLoading,
  isComplete,
  questionNumber,
  totalQuestions,
  inputMessage,
  onInputChange,
  onKeyDown,
  onSend,
  onGenerateDocument,
  onVoiceTranscript,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <ProgressSummary
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
      />
      <MessageList messages={messages} isLoading={isLoading} />
      <div className="border-t p-4 bg-gray-50">
        <ChatInput
          inputMessage={inputMessage}
          isLoading={isLoading}
          isComplete={isComplete}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          onSend={onSend}
          onGenerateDocument={onGenerateDocument}
          onVoiceTranscript={onVoiceTranscript}
        />
      </div>
    </div>
  );
}

export default ChatPanel;

