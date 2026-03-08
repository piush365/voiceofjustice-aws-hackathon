import { useState, useRef, useEffect } from 'react';

function DocumentActions({ documentText }) {
  const [showToast, setShowToast] = useState(false);
  const toastTimerRef = useRef(null);

  // Clean up timer on unmount to prevent stale setState.
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleDownload = () => {
    const blob = new Blob([documentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'legal_notice.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(documentText);
    } catch {
      // Fallback for older browsers / insecure contexts
      const textArea = document.createElement('textarea');
      textArea.value = documentText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    setShowToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
      <div className="flex space-x-3">
        <button
          onClick={handleDownload}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
        >
          📥 Download Document
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
        >
          📋 Copy to Clipboard
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✅ Copied to clipboard!
        </div>
      )}
    </>
  );
}

export default DocumentActions;



