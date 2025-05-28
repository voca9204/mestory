import React, { useState, useRef, useCallback } from 'react';
import {
  CloudArrowUpIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { mediaService } from '../services/media';
import type { MediaMetadata } from '../services/media';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  metadata?: MediaMetadata;
}

interface MediaUploaderProps {
  onUploadComplete?: (metadata: MediaMetadata[]) => void;
  onUploadProgress?: (progress: number) => void;
  maxFiles?: number;
  accept?: string;
  maxSizeInMB?: number;
  className?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onUploadComplete,
  onUploadProgress,
  maxFiles = 10,
  accept = 'image/*',
  maxSizeInMB = 100,
  className = ''
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 파일 선택 핸들러
  const handleFileSelect = useCallback((selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(file => {
      // 파일 크기 검증
      if (file.size > maxSizeInMB * 1024 * 1024) {
        alert(`파일 "${file.name}"이 ${maxSizeInMB}MB를 초과합니다.`);
        return false;
      }

      // 파일 형식 검증
      if (!file.type.startsWith('image/')) {
        alert(`파일 "${file.name}"은 이미지 파일이 아닙니다.`);
        return false;
      }

      return true;
    });

    // 최대 파일 수 검증
    const totalFiles = files.length + validFiles.length;
    if (totalFiles > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
      return;
    }

    // 파일 목록에 추가
    const newFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'uploading'
    }));

    setFiles(prev => [...prev, ...newFiles]);
    startUpload(newFiles);
  }, [files, maxFiles, maxSizeInMB]);

  // 업로드 시작
  const startUpload = async (filesToUpload: UploadedFile[]) => {
    setIsUploading(true);
    const completedMetadata: MediaMetadata[] = [];

    try {
      for (const uploadFile of filesToUpload) {
        await mediaService.uploadImage(
          uploadFile.file,
          // 진행률 콜백
          (progress) => {
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress } 
                : f
            ));

            // 전체 진행률 계산
            const totalProgress = files.reduce((sum, f) => sum + f.progress, 0) / files.length;
            onUploadProgress?.(totalProgress);
          },
          // 완료 콜백
          (metadata) => {
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'completed', metadata } 
                : f
            ));
            completedMetadata.push(metadata);
          },
          // 에러 콜백
          (error) => {
            setFiles(prev => prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'error', error: error.message } 
                : f
            ));
          }
        );
      }

      if (completedMetadata.length > 0) {
        onUploadComplete?.(completedMetadata);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // 파일 제거
  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFileSelect(droppedFiles);
  }, [handleFileSelect]);

  // 파일 입력 핸들러
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFileSelect(selectedFiles);
    }
  };

  // 파일 선택 버튼 클릭
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  // 전체 진행률 계산
  const overallProgress = files.length > 0 
    ? files.reduce((sum, f) => sum + f.progress, 0) / files.length 
    : 0;

  return (
    <div className={`w-full ${className}`}>
      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center">
          <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            이미지 업로드
          </h3>
          <p className="text-gray-600 mb-4">
            파일을 드래그하여 놓거나 아래 버튼을 클릭하세요
          </p>
          <button
            onClick={handleSelectClick}
            disabled={isUploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            파일 선택
          </button>
          <p className="text-sm text-gray-500 mt-2">
            JPEG, PNG, GIF, WebP 지원 • 최대 {maxSizeInMB}MB • {maxFiles}개까지
          </p>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* 전체 진행률 */}
      {isUploading && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>전체 진행률</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* 파일 목록 */}
      {files.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-3">
            업로드된 파일 ({files.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="relative bg-white border rounded-lg p-3 shadow-sm"
              >
                {/* 파일 미리보기 */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img
                    src={uploadFile.preview}
                    alt={uploadFile.file.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 파일 정보 */}
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadFile.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>

                {/* 상태 표시 */}
                <div className="mb-2">
                  {uploadFile.status === 'uploading' && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>업로드 중...</span>
                        <span>{Math.round(uploadFile.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadFile.status === 'completed' && (
                    <div className="flex items-center text-green-600 text-xs">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      업로드 완료
                    </div>
                  )}

                  {uploadFile.status === 'error' && (
                    <div className="flex items-center text-red-600 text-xs">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      <span className="truncate">{uploadFile.error}</span>
                    </div>
                  )}
                </div>

                {/* 제거 버튼 */}
                <button
                  onClick={() => removeFile(uploadFile.id)}
                  className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 hover:bg-opacity-100 transition-all"
                >
                  <XMarkIcon className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
