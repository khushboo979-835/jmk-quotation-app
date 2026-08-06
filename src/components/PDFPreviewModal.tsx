import React from 'react';

type Props = {
  open: boolean;
  pdfUrl?: string;
  quotationNumber?: string;
  onClose: () => void;
};

export default function PDFPreviewModal({ open, pdfUrl, quotationNumber = 'Quotation', onClose }: Props) {
  if (!open) return null;

  const handleDownload = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `Quotation_${quotationNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div>
            <h3 className="font-bold text-lg text-blue-900">Quotation PDF Viewer</h3>
            <p className="text-xs text-gray-500">Preview the exact GST formatting and active hyperlinks</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer hover:shadow-lg active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-lg font-semibold transition-all duration-200 cursor-pointer active:scale-95"
            >
              Close
            </button>
          </div>
        </div>

        {/* Modal Content - PDF Viewer */}
        <div className="flex-1 bg-gray-100 p-4">
          {pdfUrl ? (
            <iframe
              title="Quotation PDF Preview"
              src={pdfUrl}
              className="w-full h-full border border-gray-300 rounded-lg shadow-inner bg-white"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 animate-pulse"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
              <span className="font-medium">No preview available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
