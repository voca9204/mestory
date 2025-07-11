interface Timeline2DLoadingIndicatorProps {
  loadingYears: Set<number>
}

export function Timeline2DLoadingIndicator({ loadingYears }: Timeline2DLoadingIndicatorProps) {
  if (loadingYears.size === 0) return null
  
  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-700">
          {Array.from(loadingYears).join(', ')}년 데이터 로딩 중...
        </span>
      </div>
    </div>
  )
}