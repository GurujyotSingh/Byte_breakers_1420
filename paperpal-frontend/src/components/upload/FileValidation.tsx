import React from 'react';

interface FileValidationProps {
  file: File;
  maxSize: number;
  acceptedTypes: string[];
}

export const FileValidation: React.FC<FileValidationProps> = ({
  file,
  maxSize,
  acceptedTypes
}) => {
  const isValidSize = file.size <= maxSize * 1024 * 1024;
  const isValidType = acceptedTypes.some(type => 
    file.type.includes(type) || file.name.endsWith(type)
  );

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center">
        <span className="mr-2">{isValidSize ? '✅' : '❌'}</span>
        <span>Size: {(file.size / 1024 / 1024).toFixed(2)}MB / {maxSize}MB</span>
      </div>
      <div className="flex items-center">
        <span className="mr-2">{isValidType ? '✅' : '❌'}</span>
        <span>File type: {file.type || 'Unknown'}</span>
      </div>
    </div>
  );
};