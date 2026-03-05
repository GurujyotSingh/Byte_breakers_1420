import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FilePreview } from './FilePreview';
import { UploadProgress } from './UploadProgress';
import { FileValidation } from './FileValidation';
import { Document, FileType } from '../../types/document.types';

interface FileUploaderProps {
  onUpload: (file: File, metadata: any) => void;
  maxSize?: number; // in MB
  acceptedTypes?: FileType[];
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  maxSize = 10,
  acceptedTypes = ['pdf', 'docx', 'txt', 'tex']
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState({
    title: '',
    authors: '',
    journal: '',
    keywords: ''
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const selectedFile = acceptedFiles[0];
    
    // Validate file
    if (selectedFile.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }
    
    setFile(selectedFile);
    setError(null);
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }, [maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/x-tex': ['.tex']
    },
    maxFiles: 1
  });

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMetadata({
      ...metadata,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (file) {
      onUpload(file, metadata);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-3 border-dashed rounded-2xl p-12
          transition-all duration-300 cursor-pointer
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="text-center space-y-4">
          {isDragActive ? (
            <>
              <div className="text-7xl animate-bounce">📥</div>
              <p className="text-2xl font-semibold text-blue-600">
                Drop your manuscript here
              </p>
            </>
          ) : (
            <>
              <div className="text-7xl">📄</div>
              <p className="text-2xl font-semibold text-gray-700">
                Drag & drop or <span className="text-blue-600">browse</span>
              </p>
              <p className="text-gray-500">
                Supported formats: PDF, DOCX, TXT, TEX (Max: {maxSize}MB)
              </p>
            </>
          )}
        </div>

        {/* Upload Progress */}
        {uploadProgress > 0 && uploadProgress < 100 && (
          <UploadProgress progress={uploadProgress} />
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* File Preview */}
      {file && (
        <FilePreview file={file} />
      )}

      {/* Metadata Form */}
      {file && (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
          <h3 className="text-lg font-semibold">Document Metadata</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={metadata.title}
                onChange={handleMetadataChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Manuscript title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Authors
              </label>
              <input
                type="text"
                name="authors"
                value={metadata.authors}
                onChange={handleMetadataChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe, Jane Smith"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Journal
              </label>
              <input
                type="text"
                name="journal"
                value={metadata.journal}
                onChange={handleMetadataChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Nature, Science"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <input
                type="text"
                name="keywords"
                value={metadata.keywords}
                onChange={handleMetadataChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="AI, machine learning, NLP"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold"
          >
            Continue to Journal Selection →
          </button>
        </div>
      )}
    </div>
  );
};