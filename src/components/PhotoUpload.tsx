import { useState, useRef } from 'react'
import { PhotoIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'

interface PhotoUploadProps {
  photos: File[]
  onPhotosChange: (photos: File[]) => void
  maxPhotos?: number
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 10 }: PhotoUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList) => {
    const newFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && photos.length + Array.from(files).length <= maxPhotos
    )
    
    if (newFiles.length > 0) {
      onPhotosChange([...photos, ...newFiles])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files)
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    onPhotosChange(newPhotos)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      {/* 업로드 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          사진을 드래그하거나 클릭해서 업로드
        </p>
        <p className="text-xs text-gray-500 mt-1">
          최대 {maxPhotos}장까지 업로드 가능
        </p>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      {/* 업로드된 사진들 */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(photo)}
                alt={`업로드된 사진 ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg"
              />
              
              {/* 삭제 버튼 */}
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
              
              {/* 파일명 */}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                {photo.name}
              </div>
            </div>
          ))}
          
          {/* 추가 업로드 버튼 */}
          {photos.length < maxPhotos && (
            <button
              onClick={openFileDialog}
              className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors"
            >
              <PlusIcon className="w-6 h-6 text-gray-400" />
            </button>
          )}
        </div>
      )}

      {/* 사진 수 표시 */}
      <div className="text-xs text-gray-500 text-center">
        {photos.length} / {maxPhotos} 장
      </div>
    </div>
  )
}
