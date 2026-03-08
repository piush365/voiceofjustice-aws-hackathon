function ProgressSummary({ questionNumber, totalQuestions }) {
  const percentage =
    totalQuestions > 0
      ? Math.round((questionNumber / totalQuestions) * 100)
      : 0;

  return (
    <div className="bg-indigo-50 px-6 py-3 border-b">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Question {questionNumber} of {totalQuestions}
        </span>
        <span className="text-sm text-gray-500">{percentage}% Complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressSummary;

