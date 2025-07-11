import { format } from 'date-fns'

interface Timeline2DControlsProps {
  currentYear: number
  scale: number
  hoveredDate: Date | null
  tooltipData: any
  isLoadingTooltip: boolean
  yearDataCacheSize?: number
  totalDatesCount?: number
  diaryCacheSize?: number
  isWheelZoomEnabled: boolean
  showInfo?: boolean
  onGoToToday: () => void
  onRefresh: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onMoveToYear: (year: number) => void
  onToggleWheelZoom: () => void
  onToggleInfo?: () => void
}

export function Timeline2DControls({
  currentYear,
  scale,
  hoveredDate,
  tooltipData,
  isLoadingTooltip,
  yearDataCacheSize = 0,
  totalDatesCount = 0,
  diaryCacheSize = 0,
  isWheelZoomEnabled,
  showInfo = true,
  onGoToToday,
  onRefresh,
  onMoveUp,
  onMoveDown,
  onMoveLeft,
  onMoveRight,
  onZoomIn,
  onZoomOut,
  onMoveToYear,
  onToggleWheelZoom,
  onToggleInfo
}: Timeline2DControlsProps) {
  return (
    <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      {/* 정보창 토글 */}
      {onToggleInfo && (
        <div className="mb-3 flex justify-between items-center">
          <span className="text-xs font-medium text-gray-700">정보창</span>
          <button
            onClick={onToggleInfo}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {showInfo ? '숨기기' : '보이기'}
          </button>
        </div>
      )}

      {/* 성능 정보 */}
      {showInfo && (
        <>
          <div className="mb-3 p-2 bg-green-50 rounded text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-600">🚀 최적화됨</span>
            </div>
            <div className="text-gray-600">
              로딩된 연도: {yearDataCacheSize}개
            </div>
            <div className="text-gray-600">
              총 날짜: {totalDatesCount}개
            </div>
            <div className="text-gray-600">
              일기 캐시: {diaryCacheSize}개
            </div>
          </div>

          {/* 디버깅 정보 */}
          <div className="mb-3 p-2 bg-blue-50 rounded text-xs">
            <div className="text-blue-700 font-medium mb-1">🔍 툴팁 상태</div>
            <div className="text-gray-600">
              호버 날짜: {hoveredDate ? format(hoveredDate, 'M/d') : '없음'}
            </div>
            <div className="text-gray-600">
              툴팁 데이터: {tooltipData ? '✅' : '❌'}
            </div>
            <div className="text-gray-600">
              로딩 중: {isLoadingTooltip ? '⏳' : '✅'}
            </div>
          </div>
        </>
      )}

      {/* 기본 컨트롤 */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={onGoToToday}
          className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium"
        >
          오늘
        </button>
        
        <button
          onClick={onRefresh}
          className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
        >
          새로고침
        </button>
        
        <div className="border-l border-gray-200 pl-2 ml-2">
          <span className="text-xs text-gray-600">줌: {(scale * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* 방향키 네비게이션 */}
      <div className="mb-3">
        <div className="text-xs text-gray-600 mb-2">이동</div>
        <div className="grid grid-cols-3 gap-1 w-fit">
          <div></div>
          <button onClick={onMoveUp} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-xs flex items-center justify-center">↑</button>
          <div></div>
          <button onClick={onMoveLeft} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-xs flex items-center justify-center">←</button>
          <div className="w-8 h-8"></div>
          <button onClick={onMoveRight} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-xs flex items-center justify-center">→</button>
          <div></div>
          <button onClick={onMoveDown} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-xs flex items-center justify-center">↓</button>
          <div></div>
        </div>
      </div>

      {/* 줌 컨트롤 */}
      <div className="mb-3">
        <div className="text-xs text-gray-600 mb-2">줌</div>
        <div className="flex gap-1">
          <button onClick={onZoomOut} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">줌 -</button>
          <button onClick={onZoomIn} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">줌 +</button>
        </div>
        <div className="mt-2">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={isWheelZoomEnabled}
              onChange={onToggleWheelZoom}
              className="rounded"
            />
            <span className="text-gray-600">마우스 휠 줌</span>
          </label>
        </div>
      </div>

      {/* 연도 점프 */}
      <div>
        <div className="text-xs text-gray-600 mb-2">연도 이동</div>
        <div className="flex gap-1">
          <button onClick={() => onMoveToYear(currentYear - 1)} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">{currentYear - 1}</button>
          <button onClick={() => onMoveToYear(new Date().getFullYear())} className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded">{new Date().getFullYear()}</button>
          <button onClick={() => onMoveToYear(currentYear + 1)} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">{currentYear + 1}</button>
        </div>
      </div>
    </div>
  )
}