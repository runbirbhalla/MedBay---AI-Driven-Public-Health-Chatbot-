'use client';

import { AlertCircle, CheckCircle, FileText, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { uploadDocument } from '../services/api'; // <-- IMPORTANT: Use the new API function

// THIS IS INCORRECT IN THIS FILE
export const config = {
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
    },
  };

const DocumentUpload = ({ onUploadComplete, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') { // <-- CHANGED: Validate for PDF
        setError('Please select a valid PDF file.');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect({ target: { files: [file] } });
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('user_id', 'webapp_user_123'); // Or your dynamic user ID

    try {
      const result = await uploadDocument(formData); // <-- CHANGED: Call the correct API
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload document. Please try again.';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 p-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          selectedFile
            ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf" // <-- CHANGED: Accept only PDFs
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {!selectedFile ? (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium">Drop your PDF document here</p> {/* <-- CHANGED */}
              <p>or click to browse</p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isUploading}
            >
              Choose File
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <FileText className="mx-auto h-12 w-12 text-green-500" /> {/* <-- CHANGED ICON */}
            <div className="text-sm">
              <p className="font-medium text-gray-900 dark:text-gray-100">{selectedFile.name}</p>
              <p className="text-gray-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>
            </div>
            <div className="flex space-x-2 justify-center">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span> {/* <-- CHANGED */}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Upload & Process</span> {/* <-- CHANGED */}
                  </>
                )}
              </button>
              <button
                onClick={clearFile}
                disabled={isUploading}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <X className="h-4 w-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;