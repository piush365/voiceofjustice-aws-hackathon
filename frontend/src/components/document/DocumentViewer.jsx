function DocumentViewer({ documentText }) {
  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-4">
      <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
        {documentText}
      </pre>
    </div>
  );
}

export default DocumentViewer;

