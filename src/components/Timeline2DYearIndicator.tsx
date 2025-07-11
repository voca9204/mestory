interface Timeline2DYearIndicatorProps {
  currentYear: number
}

export function Timeline2DYearIndicator({ currentYear }: Timeline2DYearIndicatorProps) {
  const isCurrentYear = currentYear === new Date().getFullYear()
  
  return (
    <div className="absolute top-16 left-4 z-10 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
      <div className="text-xs text-gray-600 mb-1">현재 보고 있는 년도</div>
      <div className="text-lg font-bold text-blue-700">{currentYear}</div>
      {isCurrentYear && (
        <div className="text-xs text-gray-500 mt-1">(올해)</div>
      )}
    </div>
  )
}