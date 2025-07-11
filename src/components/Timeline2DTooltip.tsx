import { format } from 'date-fns'
import { TooltipData } from './Timeline2DTypes'
import { sanitizeText } from '../utils/sanitizer'

interface Timeline2DTooltipProps {
  tooltipData: TooltipData | null
  isLoadingTooltip: boolean
  hoveredDate: Date | null
  calculateTooltipPosition: (basePosition: { x: number, y: number }) => { x: number, y: number }
}

export function Timeline2DTooltip({ 
  tooltipData, 
  isLoadingTooltip, 
  hoveredDate,
  calculateTooltipPosition 
}: Timeline2DTooltipProps) {
  
  // 툴팁 렌더링
  if (tooltipData) {
    const position = calculateTooltipPosition(tooltipData.position)
    
    return (
      <div
        className="fixed z-[9999] bg-white rounded-lg shadow-2xl border-2 border-blue-300 p-4 w-80 pointer-events-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9999
        }}
      >
        {/* 디버깅 정보 */}
        <div className="mb-2 p-1 bg-blue-100 rounded text-xs text-blue-700">
          위치: {Math.round(tooltipData.position.x)}, {Math.round(tooltipData.position.y)} | 
          계산된 위치: {Math.round(position.x)}, {Math.round(position.y)}
        </div>

        {/* 툴팁 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-gray-900">
            {format(tooltipData.date, 'M월 d일')}
          </div>
          {tooltipData.diary?.mood && (
            <span className={`text-xs px-2 py-1 rounded-full ${
              tooltipData.diary.mood === 'great' ? 'bg-green-100 text-green-700' :
              tooltipData.diary.mood === 'good' ? 'bg-blue-100 text-blue-700' :
              tooltipData.diary.mood === 'neutral' ? 'bg-gray-100 text-gray-700' :
              tooltipData.diary.mood === 'bad' ? 'bg-yellow-100 text-yellow-700' :
              tooltipData.diary.mood === 'terrible' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {tooltipData.diary.mood === 'great' ? '😊' :
               tooltipData.diary.mood === 'good' ? '🙂' :
               tooltipData.diary.mood === 'neutral' ? '😐' :
               tooltipData.diary.mood === 'bad' ? '😕' :
               tooltipData.diary.mood === 'terrible' ? '😢' : '😐'}
            </span>
          )}
        </div>

        {/* 일기 제목 */}
        <h4 className="font-medium text-gray-900 mb-2 text-sm line-clamp-1">
          {sanitizeText(tooltipData.diary?.title || '제목 없음')}
        </h4>

        {/* 일기 내용 미리보기 */}
        <p className="text-xs text-gray-600 mb-3 line-clamp-3">
          {sanitizeText(tooltipData.diary?.content || '내용 없음')}
        </p>

        {/* 사진 썸네일 */}
        {tooltipData.diary?.photos && tooltipData.diary.photos.length > 0 && (
          <div className="mb-3">
            <div className="flex gap-1 mb-1">
              {tooltipData.diary.photos.slice(0, 3).map((photo: string, index: number) => (
                <img
                  key={index}
                  src={photo}
                  alt=""
                  className="w-12 h-12 object-cover rounded border"
                />
              ))}
              {tooltipData.diary.photos.length > 3 && (
                <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                  <span className="text-xs text-gray-500">+{tooltipData.diary.photos.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 메타 정보 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{tooltipData.diary?.wordCount || 0}자</span>
          {tooltipData.diary?.tags && tooltipData.diary.tags.length > 0 && (
            <div className="flex gap-1">
              {tooltipData.diary.tags.slice(0, 2).map((tag: string, index: number) => (
                <span key={index} className="px-1 py-0.5 bg-gray-100 rounded text-xs">
                  #{sanitizeText(tag)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 클릭 안내 */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-blue-600">클릭하여 자세히 보기 →</div>
        </div>
      </div>
    )
  }

  // 툴팁 로딩 표시
  if (isLoadingTooltip && hoveredDate) {
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-600">일기 로딩 중...</span>
        </div>
      </div>
    )
  }

  return null
}