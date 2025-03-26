'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';

interface DocumentUploadProps {
  onDocumentsSelected: (files: File[]) => void;
  maxFiles?: number;
}

export function DocumentUpload({ onDocumentsSelected, maxFiles = 5 }: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.filter(file => file.type === 'application/pdf');
    
    if (files.length + newFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files`);
      return;
    }

    setFiles(prev => [...prev, ...newFiles]);
    onDocumentsSelected(newFiles);
  }, [files, maxFiles, onDocumentsSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: maxFiles - files.length
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
      >
        <input {...getInputProps()} />
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the PDF files here'
            : 'Drag and drop PDF files here, or click to select files'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Maximum {maxFiles} files allowed
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files:</h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
              >
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 