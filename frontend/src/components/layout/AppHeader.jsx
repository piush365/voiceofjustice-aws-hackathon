function AppHeader({ sessionId, onNewChat, hasMessages }) {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">⚖️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">VoiceOfJustice</h1>
            <p className="text-sm text-gray-500">AI Legal Assistant</p>
          </div>
        </div>
        {(sessionId || hasMessages) && (
          <button
            onClick={onNewChat}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition"
          >
            New Chat
          </button>
        )}
      </div>
    </header>
  );
}

export default AppHeader;


