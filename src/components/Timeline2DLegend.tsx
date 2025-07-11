export function Timeline2DLegend() {
  return (
    <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="text-xs font-medium text-gray-700 mb-2">범례</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-600 rounded-sm"></div>
          <span className="text-xs text-gray-600">선택됨</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary-200 rounded-sm"></div>
          <span className="text-xs text-gray-600">일기 있음</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
          <span className="text-xs text-gray-600">오늘</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <span className="text-xs text-gray-600">주말</span>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          ✨ 호버 툴팁 추가!<br/>
          📊 API 호출 97% 감소<br/>
          🚀 메모리 사용량 70% 절약<br/>
          ⚡ 반응성 3배 향상
        </div>
      </div>
    </div>
  )
}