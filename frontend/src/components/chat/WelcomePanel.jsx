function WelcomePanel({ onStart, isLoading }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
      <div className="text-6xl mb-4">🙏</div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Welcome to VoiceOfJustice
      </h2>
      <p className="text-gray-600 mb-6">
        Get your security deposit back - AI-powered legal help in 5 minutes
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl mb-2">💰</div>
          <p className="text-sm font-semibold">Save ₹5,000</p>
          <p className="text-xs text-gray-600">Free legal notice</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-2xl mb-2">⚡</div>
          <p className="text-sm font-semibold">5 Minutes</p>
          <p className="text-xs text-gray-600">vs 3 weeks with lawyer</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-sm font-semibold">Court-Ready</p>
          <p className="text-xs text-gray-600">Professional format</p>
        </div>
      </div>
      <button
        onClick={onStart}
        disabled={isLoading}
        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg text-lg transition shadow-md"
      >
        {isLoading ? 'Starting…' : 'Start Chat →'}
      </button>
    </div>
  );
}

export default WelcomePanel;

