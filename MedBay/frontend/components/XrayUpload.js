'use client';

import { AlertCircle, CheckCircle, FileImage, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { uploadXrayImage } from '../services/api';

const XrayUpload = ({ onUploadComplete, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
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
    setUploadResult(null);

    try {
      const result = await uploadXrayImage(selectedFile);
      setUploadResult(result);
      if (onUploadComplete) {
        onUploadComplete(result);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to upload X-ray image. Please try again.';
      setError(errorMessage);
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    setUploadResult(null);
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
    <div className="w-full max-w-md mx-auto space-y-4">
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
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        {!selectedFile ? (
          <div className="space-y-2">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium">Drop your X-ray image here</p>
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
            <FileImage className="mx-auto h-12 w-12 text-green-500" />
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
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Analyze X-ray</span>
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

      {/* Upload Result */}
      {uploadResult && (
        <div className="space-y-3">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-green-800 dark:text-green-200">Analysis Complete</h3>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Successfully analyzed: {uploadResult.filename}
            </p>
          </div>

          {/* Medical Report */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Medical Report</h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">
              {uploadResult.medical_report}
            </div>
          </div>

          {/* Analysis Results */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md">
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-3">Detailed Analysis</h4>
            <div className="space-y-2">
              {uploadResult.analysis_results.slice(0, 5).map((result, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{result.label}</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    result.probability > 0.5 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : result.probability > 0.3
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {(result.probability * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            <strong>Disclaimer:</strong> This is a preliminary AI analysis for informational purposes only. 
            Always consult with a qualified healthcare professional for proper medical diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default XrayUpload;
