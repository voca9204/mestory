import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay, getDayOfYear } from 'date-fns'
import { useData } from '../contexts/DataContext'
import { Timeline2DProps, TooltipData, DragState, Offset } from './Timeline2DTypes'
import { Timeline2DTooltip } from './Timeline2DTooltip'
import { Timeline2DLegend } from './Timeline2DLegend'
import { Timeline2DControls } from './Timeline2DControls'
import { Timeline2DHeader } from './Timeline2DHeader'
import { Timeline2DDateCell } from './Timeline2DDateCell'
import { Timeline2DUsageGuide } from './Timeline2DUsageGuide'
import { Timeline2DYearIndicator } from './Timeline2DYearIndicator'
import { Timeline2DSelectedInfo } from './Timeline2DSelectedInfo'
import { Timeline2DLoadingIndicator } from './Timeline2DLoadingIndicator'
import { useTimeline2DData } from './useTimeline2DData'
import { 
  calculateTooltipPosition, 
  getMonthBoundaries, 
  isWeekend,
  DEFAULT_GRID_CONFIG,
  NAVIGATION,
  CANVAS_CONFIG 
} from './Timeline2DUtils'
export function Timeline2D({ selectedDate, onDateSelect }: Timeline2DProps) {
  const { isUsingMockData } = useData()
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [scale, setScale] = useState(2)
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, lastX: 0, lastY: 0 })
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 })
  const [isInitialized, setIsInitialized] = useState(false)
  
  const {
    yearDataCache,
    loadingYears,
    hasDataForDate,
    loadDiaryForTooltip,
    loadVisibleYears,
    loadYearData,
    clearCache
  } = useTimeline2DData()
  
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null)
  const [isLoadingTooltip, setIsLoadingTooltip] = useState(false)
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const todayCellRef = useRef<HTMLDivElement>(null)
  const cellSize = DEFAULT_GRID_CONFIG.cellSize * scale
  const gapSize = DEFAULT_GRID_CONFIG.gapSize
  const monthLabels = DEFAULT_GRID_CONFIG.monthLabels
  const currentYearNum = new Date().getFullYear()
  const years = useMemo(() => {
    const startYear = currentYearNum - 5
    const endYear = currentYearNum + 10
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  }, [currentYearNum])
  const maxDaysInYear = DEFAULT_GRID_CONFIG.maxDaysInYear
  const [isAnimating, setIsAnimating] = useState(false)
  const handleDateMouseEnter = useCallback((date: Date, event: React.MouseEvent) => {
    const hasData = hasDataForDate(date)
    const isDragging = dragState.isDragging
    
    if (!hasData || isDragging) {
      return
    }
    
    setHoveredDate(date)
    
    // 이전 타이머 정리
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
    }
    // 마우스 위치 계산 (컨테이너 기준, 스케일과 오프셋 고려)
    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect()
      const mousePosition = {
        x: event.clientX - containerRect.left,
        y: event.clientY - containerRect.top
      }
      console.log('🖱️ 마우스 이벤트:', {
        날짜: format(date, 'M/d'), 
        마우스좌표: `(${event.clientX}, ${event.clientY})`,
        컨테이너좌표: `(${mousePosition.x}, ${mousePosition.y})`,
        일기있음: hasData
      })
      // 300ms 후에 툴팁 표시 (디바운스)
      tooltipTimeoutRef.current = setTimeout(async () => {
        setIsLoadingTooltip(true)
        try {
          const diary = await loadDiaryForTooltip(date)
          if (hoveredDate && isSameDay(hoveredDate, date)) {
            setTooltipData({
              date,
              diary,
              position: mousePosition
            })
          }
        } catch (error) {
          console.error('일기 로딩 실패:', error)
        } finally {
          setIsLoadingTooltip(false)
        }
      }, 300)
    }
  }, [hasDataForDate, dragState.isDragging, loadDiaryForTooltip])
  const handleDateMouseLeave = useCallback(() => {
    setHoveredDate(null)
    setTooltipData(null)
    
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }
  }, [])
  const calculateVisibleYears = useCallback(() => {
    if (!containerRef.current) return []
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerHeight = containerRect.height
    
    const padding = 32
    const headerHeight = 26
    const yearRowHeight = cellSize + gapSize
    
    const topY = (-offset.y) / scale
    const bottomY = (-offset.y + containerHeight) / scale
    
    const startYearIndex = Math.max(0, Math.floor((topY - padding - headerHeight) / yearRowHeight) - 1)
    const endYearIndex = Math.min(years.length - 1, Math.ceil((bottomY - padding - headerHeight) / yearRowHeight) + 1)
    
    // 가시 영역의 연도들 반환
    const visibleYears = []
    for (let i = startYearIndex; i <= endYearIndex; i++) {
      if (i >= 0 && i < years.length) {
        visibleYears.push(years[i])
      }
    }
    return visibleYears
  }, [offset.y, scale, cellSize, gapSize, years])
  useEffect(() => {
    const timer = setTimeout(() => {
      const visibleYears = calculateVisibleYears()
      loadVisibleYears(visibleYears)
    }, 200) // 200ms 디바운스
    
    return () => clearTimeout(timer)
  }, [offset, scale, calculateVisibleYears, loadVisibleYears])
  useEffect(() => {
    if (isInitialized) {
      const currentYearNum = new Date().getFullYear()
      // 현재 연도만 미리 로딩
      loadYearData(currentYearNum)
    }
  }, [isInitialized, loadYearData])
  const updateCurrentViewYear = useCallback(() => {
    if (!containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerCenterY = containerRect.height / 2
    
    const padding = 32
    const headerHeight = 26
    
    const actualCenterY = (containerCenterY - offset.y) / scale
    const yearRowHeight = cellSize + gapSize
    const yearIndex = Math.round((actualCenterY - padding - headerHeight) / yearRowHeight)
    
    if (yearIndex >= 0 && yearIndex < years.length) {
      const viewYear = years[yearIndex]
      if (viewYear !== currentYear) {
        setCurrentYear(viewYear)
      }
    }
  }, [offset.y, scale, cellSize, gapSize, years, currentYear])
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCurrentViewYear()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [offset, scale])
  // 초기 위치 설정
  useEffect(() => {
    if (!isInitialized && containerRef.current) {
      const today = new Date()
      
      if (!selectedDate) {
        onDateSelect(today)
      }
      
      setCurrentYear(today.getFullYear())
      setIsAnimating(true)
      setScale(2.0)
      
      const performCenterOnToday = () => {
        if (!containerRef.current) return
        
        const today = new Date()
        const todayYear = today.getFullYear()
        const todayDayOfYear = getDayOfYear(today)
        const yearIndex = years.findIndex(year => year === todayYear)
        
        if (yearIndex !== -1) {
          const containerRect = containerRef.current.getBoundingClientRect()
          const containerCenterX = containerRect.width / 2
          const containerHeight = containerRect.height
          
          const padding = 32
          const headerHeight = 26
          const yearLabelWidth = 64
          const currentCellSize = 12 * 2.0
          const currentGapSize = 1
          
          const cellX = yearLabelWidth + padding + (todayDayOfYear - 1) * (currentCellSize + currentGapSize) + currentCellSize/2
          const cellY = padding + headerHeight + yearIndex * (currentCellSize + currentGapSize) + currentCellSize/2
          const targetY = containerHeight * 0.33
          
          const targetOffsetX = containerCenterX - cellX * 2.5
          const targetOffsetY = targetY - cellY * 2.5
          
          setOffset({
            x: targetOffsetX,
            y: targetOffsetY
          })
        }
      }
      
      setTimeout(() => {
        performCenterOnToday()
      }, 100)
      
      setTimeout(() => {
        performCenterOnToday()
        setIsInitialized(true)
        setIsAnimating(false)
      }, 500)
    }
  }, [isInitialized, selectedDate, onDateSelect, years])
  // 오늘로 이동
  const goToToday = useCallback(() => {
    const today = new Date()
    setIsAnimating(true)
    setCurrentYear(today.getFullYear())
    onDateSelect(today)
    
    if (scale < 2 || scale > 4) {
      setScale(3)
    }
    
    setTimeout(() => {
      if (containerRef.current) {
        const today = new Date()
        const todayYear = today.getFullYear()
        const todayDayOfYear = getDayOfYear(today)
        const yearIndex = years.findIndex(year => year === todayYear)
        
        if (yearIndex !== -1) {
          const containerRect = containerRef.current.getBoundingClientRect()
          const containerCenterX = containerRect.width / 2
          const containerHeight = containerRect.height
          
          const padding = 32
          const headerHeight = 26
          const yearLabelWidth = 64
          const currentCellSize = 12 * scale
          const currentGapSize = 1
          
          const cellX = yearLabelWidth + padding + (todayDayOfYear - 1) * (currentCellSize + currentGapSize) + currentCellSize/2
          const cellY = padding + headerHeight + yearIndex * (currentCellSize + currentGapSize) + currentCellSize/2
          const targetY = containerHeight * 0.33
          
          const targetOffsetX = containerCenterX - cellX * scale
          const targetOffsetY = targetY - cellY * scale
          
          setOffset({
            x: targetOffsetX,
            y: targetOffsetY
          })
        }
      }
      
      setTimeout(() => {
        setIsAnimating(false)
      }, 150)
    }, 50)
  }, [onDateSelect, years, scale])
  // 드래그 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsAnimating(false)
    setTooltipData(null) // 드래그 시작하면 툴팁 숨김
    setDragState({
      isDragging: true,
      lastX: e.clientX,
      lastY: e.clientY
    })
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.isDragging) return
    const deltaX = (e.clientX - dragState.lastX) * 0.8
    const deltaY = (e.clientY - dragState.lastY) * 0.8
    setOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }))
    setDragState(prev => ({
      ...prev,
      lastX: e.clientX,
      lastY: e.clientY
    }))
  }
  const handleMouseUp = () => {
    setDragState(prev => ({ ...prev, isDragging: false }))
  }
  // 버튼 기반 네비게이션
  const moveStep = 100
  const moveLeft = () => setOffset(prev => ({ ...prev, x: prev.x + moveStep }))
  const moveRight = () => setOffset(prev => ({ ...prev, x: prev.x - moveStep }))
  const moveUp = () => setOffset(prev => ({ ...prev, y: prev.y + moveStep }))
  const moveDown = () => setOffset(prev => ({ ...prev, y: prev.y - moveStep }))
  const zoomIn = () => setScale(prev => Math.min(4, prev * 1.2))
  const zoomOut = () => setScale(prev => Math.max(1.5, prev / 1.2))
  // 연도 단위 이동
  const moveToYear = (targetYear: number) => {
    const yearIndex = years.findIndex(year => year === targetYear)
    if (yearIndex === -1) return
    
    if (!containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerHeight = containerRect.height
    
    const padding = 32
    const headerHeight = 26
    const cellY = padding + headerHeight + yearIndex * (cellSize + gapSize) + cellSize/2
    const targetY = containerHeight * 0.33
    const targetOffsetY = targetY - cellY * scale
    
    setIsAnimating(true)
    setOffset(prev => ({ ...prev, y: targetOffsetY }))
    setCurrentYear(targetYear)
    
    setTimeout(() => setIsAnimating(false), 300)
  }
  // 휠 줌 핸들러
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05
    setScale(prev => Math.max(1.5, Math.min(4, prev * zoomFactor)))
  }
  // 날짜 클릭 핸들러
  const handleDateClick = (date: Date) => {
    setTooltipData(null) // 클릭 시 툴팁 숨김
    onDateSelect(date)
  }
  // 특정 날짜가 선택되었는지 확인
  const isDateSelected = (date: Date) => {
    return selectedDate ? isSameDay(date, selectedDate) : false
  }
  // 월별 구분선 위치 계산
  const getMonthBoundaries = (year: number) => {
    const boundaries = []
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(year, month, 1)
      const dayOfYear = getDayOfYear(firstDay)
      boundaries.push(dayOfYear - 1)
    }
    return boundaries
  }
  // 🎯 NEW: 툴팁 위치 계산 (화면 경계 고려) - Fixed 위치용
  const calculateTooltipPosition = (basePosition: { x: number, y: number }) => {
    if (!containerRef.current) return basePosition
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const tooltipWidth = 320
    const tooltipHeight = 250 // 좀 더 높게 설정
    const padding = 20
    
    // 컨테이너 상대 위치를 화면 절대 위치로 변환
    const screenX = containerRect.left + basePosition.x
    const screenY = containerRect.top + basePosition.y
    
    let x = screenX + 15 // 마우스에서 약간 오른쪽
    let y = screenY - tooltipHeight - 10 // 마우스 위쪽
    
    // 오른쪽 경계 확인 (전체 화면 기준)
    if (x + tooltipWidth > window.innerWidth - padding) {
      x = screenX - tooltipWidth - 15
    }
    
    // 위쪽 경계 확인
    if (y < padding) {
      y = screenY + 25 // 마우스 아래쪽으로 이동
    }
    
    // 아래쪽 경계 확인
    if (y + tooltipHeight > window.innerHeight - padding) {
      y = window.innerHeight - tooltipHeight - padding
    }
    
    // 왼쪽 경계 확인
    if (x < padding) {
      x = padding
    }
    
    return { x: Math.max(0, x), y: Math.max(0, y) }
  }
  return (
    <div className="relative w-full h-[500px] overflow-hidden border border-gray-200 rounded-lg bg-gray-50">
      {/* 로딩 상태 표시 */}
      <Timeline2DLoadingIndicator loadingYears={loadingYears} />
      {/* 현재 보고 있는 년도 표시 */}
      <Timeline2DYearIndicator currentYear={currentYear} />
      {/* 컨트롤 패널 */}
      <Timeline2DControls
        currentYear={currentYear}
        scale={scale}
        hoveredDate={hoveredDate}
        tooltipData={tooltipData}
        isLoadingTooltip={isLoadingTooltip}
        yearDataCacheSize={yearDataCache.size}
        totalDatesCount={Array.from(yearDataCache.values()).reduce((sum, dateSet) => sum + dateSet.size, 0)}
        diaryCacheSize={0} // diaryCache가 useTimeline2DData 내부에 있음
        onGoToToday={goToToday}
        onRefresh={() => {
          clearCache()
          setTooltipData(null)
        }}
        onMoveUp={moveUp}
        onMoveDown={moveDown}
        onMoveLeft={moveLeft}
        onMoveRight={moveRight}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onMoveToYear={moveToYear}
      />
      {/* 사용법 안내 */}
      <Timeline2DUsageGuide />
      {/* 툴팁 컴포넌트 */}
      <Timeline2DTooltip
        tooltipData={tooltipData}
        isLoadingTooltip={isLoadingTooltip}
        hoveredDate={hoveredDate}
        calculateTooltipPosition={calculateTooltipPosition}
      />
      {/* 2D 타임라인 그리드 */}
      <div
        ref={containerRef}
        className={`w-full h-full cursor-grab active:cursor-grabbing ${
          isAnimating ? 'transition-transform duration-300 ease-out' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          handleMouseUp()
          handleDateMouseLeave()
        }}
        onWheel={handleWheel}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        <div className="p-8">
          {/* 월 라벨 (수평 상단) */}
          <Timeline2DHeader
            cellSize={cellSize}
            gapSize={gapSize}
            maxDaysInYear={maxDaysInYear}
            monthLabels={monthLabels}
            getMonthBoundaries={getMonthBoundaries}
          />
          {/* 연도별 열 */}
          {years.map((year, yearIndex) => {
            const isCurrentYear = year === new Date().getFullYear()
            const yearDates = eachDayOfInterval({
              start: startOfYear(new Date(year, 0, 1)),
              end: endOfYear(new Date(year, 0, 1))
            })
            
            return (
              <div key={year} className="flex items-start mb-1">
                {/* 연도 라벨 */}
                <div 
                  className={`w-16 text-xs font-medium text-right pr-2 py-1 border-r-2 border-gray-400 shadow-sm ${
                    isCurrentYear ? 'text-white font-bold bg-blue-600' : 'text-gray-700 bg-gray-100'
                  }`}
                  style={{ 
                    height: `${cellSize + gapSize}px`,
                    position: 'sticky',
                    left: '0',
                    zIndex: 25
                  }}
                >
                  {year}
                </div>
                {/* 날짜 그리드 */}
                <div className="flex">
                  {Array.from({ length: maxDaysInYear }, (_, dayIndex) => {
                    const date = yearDates[dayIndex]
                    
                    if (!date) {
                      return (
                        <div
                          key={dayIndex}
                          style={{
                            width: `${cellSize}px`,
                            height: `${cellSize}px`,
                            marginRight: `${gapSize}px`,
                          }}
                        />
                      )
                    }
                    const isSelected = isDateSelected(date)
                    const hasData = hasDataForDate(date)
                    const isToday = isSameDay(date, new Date())
                    const weekend = isWeekend(date)
                    const isHovered = hoveredDate && isSameDay(hoveredDate, date)
                    
                    return (
                      <Timeline2DDateCell
                        key={dayIndex}
                        ref={isToday ? todayCellRef : undefined}
                        date={date}
                        dayIndex={dayIndex}
                        cellSize={cellSize}
                        gapSize={gapSize}
                        hasData={hasData}
                        isSelected={isSelected}
                        isToday={isToday}
                        isWeekend={weekend}
                        isHovered={isHovered}
                        onDateClick={handleDateClick}
                        onDateMouseEnter={handleDateMouseEnter}
                        onDateMouseLeave={handleDateMouseLeave}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {/* 범례 */}
      <Timeline2DLegend />
      {/* 선택된 날짜 정보 */}
      <Timeline2DSelectedInfo selectedDate={selectedDate} />
    </div>
  )
}