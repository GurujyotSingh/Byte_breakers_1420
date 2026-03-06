import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentParser, ParsedDocument } from '../../services/documentParser';

interface FileUploaderProps {
  onDocumentParsed: (doc: ParsedDocument, file: File) => void;
  maxSize?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  onDocumentParsed, 
  maxSize = 10 
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{name: string; size: string} | null>(null);
  
  const parser = new DocumentParser();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }
    
    setError(null);
    setIsParsing(true);
    setFileInfo({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      // Parse the document
      const parsedDoc = await parser.parseDocument(file);
      
      setProgress(100);
      setTimeout(() => {
        onDocumentParsed(parsedDoc, file);
        setIsParsing(false);
      }, 500);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse document');
      setIsParsing(false);
    } finally {
      clearInterval(interval);
    }
  }, [maxSize, onDocumentParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.google-apps.document': ['.gdoc'],
      'text/plain': ['.txt']
    },
    maxFiles: 1
  });

  const getFileIcon = () => {
    if (!fileInfo) return '📄';
    if (fileInfo.name.endsWith('.pdf')) return '📕';
    if (fileInfo.name.endsWith('.docx')) return '📘';
    if (fileInfo.name.endsWith('.gdoc')) return '📗';
    return '📄';
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`
          relative border-3 border-dashed rounded-2xl p-12
          transition-all duration-300 cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${isParsing ? 'pointer-events-none opacity-75' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="text-center space-y-4">
          {isParsing ? (
            <>
              <div className="text-7xl animate-bounce">{getFileIcon()}</div>
              <p className="text-2xl font-semibold text-blue-600">
                Parsing your document...
              </p>
              {fileInfo && (
                <p className="text-gray-500">
                  {fileInfo.name} ({fileInfo.size})
                </p>
              )}
              <div className="max-w-md mx-auto mt-4">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Extracting structure • Analyzing citations • Identifying sections
                </p>
              </div>
            </>
          ) : isDragActive ? (
            <>
              <div className="text-7xl">📥</div>
              <p className="text-2xl font-semibold text-blue-600">
                Drop your document here
              </p>
              <p className="text-gray-500">
                We support PDF, Word, Google Docs, and Text files
              </p>
            </>
          ) : (
            <>
              <div className="text-7xl">📄</div>
              <p className="text-2xl font-semibold text-gray-700">
                Drag & drop or <span className="text-blue-600">browse</span>
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">📕 PDF</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">📘 DOCX</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">📗 Google Docs</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">📃 TXT</span>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Max file size: {maxSize}MB • All formats supported
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="font-semibold">❌ Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-2">✨ Supported Features</p>
        <ul className="grid grid-cols-2 gap-2">
          <li className="flex items-center"><span className="mr-2">✅</span> Extract title & authors</li>
          <li className="flex items-center"><span className="mr-2">✅</span> Identify headings</li>
          <li className="flex items-center"><span className="mr-2">✅</span> Parse citations</li>
          <li className="flex items-center"><span className="mr-2">✅</span> Extract references</li>
          <li className="flex items-center"><span className="mr-2">✅</span> Detect figures/tables</li>
          <li className="flex items-center"><span className="mr-2">✅</span> Preserve structure</li>
        </ul>
      </div>
    </div>
  );
};