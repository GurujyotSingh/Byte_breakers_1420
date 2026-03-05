import React from 'react';

interface FilePreviewProps {
  file: File;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center space-x-3">
        <div className="text-3xl">
          {file.type.includes('pdf') ? '📕' : 
           file.type.includes('word') ? '📘' : '📄'}
        </div>
        <div className="flex-1">
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-gray-500">
            {(file.size / 1024).toFixed(2)} KB • 
            {file.type || 'Unknown type'}
          </p>
        </div>
        <div className="text-green-600">✓</div>
      </div>
    </div>
  );
};