interface Timeline2DYearIndicatorProps {
  currentYear: number
}

export function Timeline2DYearIndicator({ currentYear }: Timeline2DYearIndicatorProps) {
  const isCurrentYear = currentYear === new Date().getFullYear()
  
  return (
    <div className="absolute top-4 right-24 z-20 bg-blue-600 text-white rounded-lg shadow-lg p-3">
      <div className="text-xs opacity-90 mb-1">현재 위치</div>
      <div className="text-2xl font-bold">{currentYear}년</div>
      {isCurrentYear && (
        <div className="text-xs bg-blue-700 rounded px-2 py-1 mt-2 text-center">올해</div>
      )}
    </div>
  )
}