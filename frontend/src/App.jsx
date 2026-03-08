import AppHeader from './components/layout/AppHeader';
import AppFooter from './components/layout/AppFooter';
import WelcomePanel from './components/chat/WelcomePanel';
import ChatPanel from './components/chat/ChatPanel';
import DocumentViewer from './components/document/DocumentViewer';
import DocumentActions from './components/document/DocumentActions';
import AiDisclaimer from './components/document/AiDisclaimer';
import ReadAloud from './components/document/ReadAloud';
import { useChatSession } from './hooks/useChatSession';
import { useCallback } from 'react';

function App() {
  const {
    sessionId,
    messages,
    inputMessage,
    isLoading,
    isComplete,
    generatedDocument,
    questionNumber,
    totalQuestions,
    setInputMessage,
    startConversation,
    sendMessageToAssistant,
    generateDocument,
    startNewConversation,
  } = useChatSession();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageToAssistant();
    }
  };

  /**
   * When voice input produces a transcript, send it directly as a message.
   */
  const handleVoiceTranscript = useCallback(
    (text) => {
      sendMessageToAssistant(text);
    },
    [sendMessageToAssistant],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <AppHeader sessionId={sessionId} onNewChat={startNewConversation} hasMessages={messages.length > 0} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {messages.length === 0 && (
          <WelcomePanel onStart={startConversation} isLoading={isLoading} />
        )}

        {messages.length > 0 && !generatedDocument && (
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            isComplete={isComplete}
            questionNumber={questionNumber}
            totalQuestions={totalQuestions}
            inputMessage={inputMessage}
            onInputChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onSend={sendMessageToAssistant}
            onGenerateDocument={generateDocument}
            onVoiceTranscript={handleVoiceTranscript}
          />
        )}

        {generatedDocument && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                ✅ Your Legal Notice is Ready!
              </h2>
              <button
                onClick={startNewConversation}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Create Another
              </button>
            </div>

            <ReadAloud text={generatedDocument} />
            <DocumentViewer documentText={generatedDocument} />
            <DocumentActions documentText={generatedDocument} />
            <AiDisclaimer />
          </div>
        )}
      </main>

      <AppFooter />
    </div>
  );
}

export default App;