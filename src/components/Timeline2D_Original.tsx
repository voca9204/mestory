import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { format, startOfYear, endOfYear, eachDayOfInterval, isSameDay, getDayOfYear, isLeapYear } from 'date-fns'
import { useData } from '../contexts/DataContext'

interface Timeline2DProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
}

export function Timeline2D({ selectedDate, onDateSelect }: Timeline2DProps) {
  const { isUsingMockData, hasDataForDate, getDiaryByDate, getDatesWithData } = useData()
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [scale, setScale] = useState(2) // 기본 줌을 200%로 설정
  const [dragState, setDragState] = useState({ isDragging: false, lastX: 0, lastY: 0 })
  
  // 🚀 성능 최적화를 위한 데이터 캐싱 - 대폭 개선
  const [dataCache, setDataCache] = useState<Map<string, boolean>>(new Map())
  const [diaryCache, setDiaryCache] = useState<Map<string, any>>(new Map())
  const [isLoadingData, setIsLoadingData] = useState(false)
  const [batchLoadingYears, setBatchLoadingYears] = useState<Set<number>>(new Set())

  // 🚀 NEW: 배치 처리로 연도별 데이터 존재 여부를 한 번에 조회
  const loadYearDataOptimized = useCallback(async (year: number) => {
    if (batchLoadingYears.has(year)) return // 이미 로딩 중인 연도는 스킵
    
    console.log(`🚀 [OPTIMIZED] Starting ultra-fast batch data loading for year ${year}...`)
    setBatchLoadingYears(prev => new Set(prev).add(year))
    setIsLoadingData(true)
    
    try {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      
      // 🔥 핵심 최적화: 단일 쿼리로 연도 전체의 데이터 존재 날짜들을 조회
      const datesWithData = await getDatesWithData(startDate, endDate)
      console.log(`📊 Year ${year}: Found ${datesWithData.length} dates with data`)
      
      // 연도의 모든 날짜를 생성
      const yearDates = eachDayOfInterval({
        start: startOfYear(new Date(year, 0, 1)),
        end: endOfYear(new Date(year, 0, 1))
      })
      
      // 데이터 존재 날짜들을 Set으로 변환 (빠른 검색을 위해)
      const dataDateSet = new Set(datesWithData)
      
      // 배치로 캐시 업데이트 (개별 API 호출 없이)
      const newDataCache = new Map(dataCache)
      yearDates.forEach(date => {
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        const hasData = dataDateSet.has(dateString)
        newDataCache.set(dateString, hasData)
      })
      
      setDataCache(newDataCache)
      
      // 필요한 경우 일기 데이터도 미리 로딩 (선택적)
      if (datesWithData.length <= 50) { // 일기가 너무 많지 않으면 미리 로딩
        console.log(`💾 Pre-loading ${datesWithData.length} diaries for year ${year}`)
        const diaryPromises = datesWithData.map(async (dateString) => {
          try {
            const diary = await getDiaryByDate(dateString)
            if (diary) {
              setDiaryCache(prev => new Map(prev.set(dateString, diary)))
            }
          } catch (error) {
            console.warn(`Error pre-loading diary for ${dateString}:`, error)
          }
        })
        
        // 10개씩 배치로 처리
        for (let i = 0; i < diaryPromises.length; i += 10) {
          const batch = diaryPromises.slice(i, i + 10)
          await Promise.all(batch)
          console.log(`📖 Pre-loaded diaries: ${Math.min(i + 10, diaryPromises.length)}/${diaryPromises.length}`)
        }
      }
      
      console.log(`✅ [OPTIMIZED] Completed ultra-fast batch loading for year ${year}`)
    } catch (error) {
      console.error(`❌ Error in optimized batch loading for year ${year}:`, error)
    } finally {
      setBatchLoadingYears(prev => {
        const newSet = new Set(prev)
        newSet.delete(year)
        return newSet
      })
      
      // 모든 연도 로딩이 완료되면 전체 로딩 상태 해제
      if (batchLoadingYears.size <= 1) {
        setIsLoadingData(false)
      }
    }
  }, [getDatesWithData, getDiaryByDate, dataCache, batchLoadingYears])

  // 캐시된 데이터로 hasDataForDate 확인하는 함수
  const getCachedDataStatus = useCallback((date: Date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return dataCache.get(dateString) || false
  }, [dataCache])

  // 캐시된 일기 데이터 가져오는 함수 - 성능 최적화
  const getDiaryOptimized = useCallback((date: Date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    // 캐시된 일기 데이터가 있으면 반환
    if (diaryCache.has(dateString)) {
      return diaryCache.get(dateString)
    }
    
    // 캐시에 없고 데이터가 있다고 확인된 경우에만 로딩 시도
    if (dataCache.get(dateString) === true) {
      // 일기 데이터만 별도로 로딩 (이미 데이터 존재가 확인됨)
      getDiaryByDate(dateString).then(diary => {
        if (diary) {
          setDiaryCache(prev => new Map(prev.set(dateString, diary)))
        }
      }).catch(error => {
        console.error(`Error loading diary for ${dateString}:`, error)
      })
    }
    
    return null
  }, [diaryCache, dataCache, getDiaryByDate])

  // 데이터 캐시 초기화 함수
  const clearDataCache = useCallback(() => {
    setDataCache(new Map())
    setDiaryCache(new Map())
    setBatchLoadingYears(new Set())
    console.log('🗑️ Data cache cleared')
  }, [])

  // 상태 변수들
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isInitialized, setIsInitialized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const todayCellRef = useRef<HTMLDivElement>(null)

  // 그리드 설정
  const cellSize = 12 * scale
  const gapSize = 1
  const monthLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

  // 연도 범위 설정
  const currentYearNum = new Date().getFullYear()
  const years = useMemo(() => {
    const startYear = currentYearNum - 5  // 과거 5년
    const endYear = currentYearNum + 10   // 미래 10년
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)
  }, [currentYearNum])

  const maxDaysInYear = 366
  const [isAnimating, setIsAnimating] = useState(false)

  // 가시 영역의 연도들을 계산하고 데이터를 로딩하는 함수 - 최적화 적용
  const loadVisibleYearsData = useCallback(() => {
    if (!containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerHeight = containerRect.height
    
    const padding = 32
    const headerHeight = 26
    const yearRowHeight = cellSize + gapSize
    
    const topY = (-offset.y) / scale
    const bottomY = (-offset.y + containerHeight) / scale
    
    const startYearIndex = Math.max(0, Math.floor((topY - padding - headerHeight) / yearRowHeight) - 1)
    const endYearIndex = Math.min(years.length - 1, Math.ceil((bottomY - padding - headerHeight) / yearRowHeight) + 1)
    
    // 가시 영역의 연도들을 최적화된 방식으로 로딩
    for (let i = startYearIndex; i <= endYearIndex; i++) {
      if (i >= 0 && i < years.length) {
        const year = years[i]
        loadYearDataOptimized(year) // 🚀 최적화된 함수 사용
      }
    }
    
    console.log(`📍 [OPTIMIZED] Loading data for visible years: ${years.slice(startYearIndex, endYearIndex + 1).join(', ')}`)
  }, [offset.y, scale, cellSize, gapSize, years, loadYearDataOptimized])

  // 뷰포트 변경 시 가시 영역 데이터 로딩
  useEffect(() => {
    const timer = setTimeout(() => {
      loadVisibleYearsData()
    }, 300)
    
    return () => clearTimeout(timer)
  }, [offset, scale, loadVisibleYearsData])

  // 초기 로드 시 현재 연도와 주변 연도 데이터 로딩 - 최적화 적용
  useEffect(() => {
    if (isInitialized) {
      const currentYearNum = new Date().getFullYear()
      // 현재 연도와 전후 2년씩 미리 로딩 (최적화된 방식)
      for (let i = -2; i <= 2; i++) {
        const year = currentYearNum + i
        if (years.includes(year)) {
          loadYearDataOptimized(year) // 🚀 최적화된 함수 사용
        }
      }
    }
  }, [isInitialized, years, loadYearDataOptimized])

  // 현재 보이는 년도 계산 및 업데이트
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

  // offset이나 scale이 변경될 때마다 현재 년도 업데이트
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCurrentViewYear()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [offset, scale, updateCurrentViewYear])

  // 초기 로드 시 최적의 위치로 설정
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

  // 오늘로 이동 함수
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
    onDateSelect(date)
  }

  // 특정 날짜가 선택되었는지 확인
  const isDateSelected = (date: Date) => {
    return selectedDate ? isSameDay(date, selectedDate) : false
  }

  // 날짜에 데이터가 있는지 확인 - 캐시 우선 사용으로 성능 최적화
  const hasDataForDateOptimized = useCallback((date: Date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    // 캐시된 데이터가 있으면 즉시 반환
    if (dataCache.has(dateString)) {
      return dataCache.get(dateString) || false
    }
    
    // 캐시에 없으면 해당 연도 데이터 로딩 시작 (비동기)
    const year = date.getFullYear()
    if (!batchLoadingYears.has(year)) {
      loadYearDataOptimized(year)
    }
    
    // 로딩 중에는 false 반환 (나중에 캐시 업데이트되면 리렌더링됨)
    return false
  }, [dataCache, batchLoadingYears, loadYearDataOptimized])

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

  return (
    <div className="relative w-full h-[500px] overflow-hidden border border-gray-200 rounded-lg bg-gray-50">
      {/* 데이터 로딩 상태 표시 */}
      {isLoadingData && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-gray-700">일기 데이터 로딩 중...</span>
            {batchLoadingYears.size > 0 && (
              <span className="text-xs text-gray-500">
                ({Array.from(batchLoadingYears).join(', ')}년)
              </span>
            )}
          </div>
        </div>
      )}

      {/* 현재 보고 있는 년도 표시 */}
      <div className="absolute top-16 left-4 z-10 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
        <div className="text-xs text-gray-600 mb-1">현재 보고 있는 년도</div>
        <div className="text-lg font-bold text-blue-700">{currentYear}</div>
        <div className="text-xs text-gray-500 mt-1">
          {currentYear === new Date().getFullYear() ? '(올해)' : ''}
        </div>
      </div>

      {/* 컨트롤 패널 */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        {/* 데이터 상태 표시 */}
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-gray-600">캐시된 날짜:</span>
            <span className="font-medium text-blue-600">{dataCache.size}개</span>
            {isLoadingData && (
              <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">일기 캐시:</span>
            <span className="font-medium text-green-600">{diaryCache.size}개</span>
          </div>
          {batchLoadingYears.size > 0 && (
            <div className="text-xs text-orange-600 mt-1">
              로딩 중: {Array.from(batchLoadingYears).join(', ')}년
            </div>
          )}
        </div>

        {/* 기본 컨트롤 */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium"
          >
            오늘
          </button>
          
          <button
            onClick={() => {
              setIsAnimating(true)
              setScale(2.0)
              setTimeout(() => {
                goToToday()
                setTimeout(() => setIsAnimating(false), 150)
              }, 50)
            }}
            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
          >
            초기화
          </button>

          <button
            onClick={clearDataCache}
            className="px-2 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded transition-colors"
            title="데이터 캐시 초기화"
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
            <button onClick={moveUp} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-xs flex items-center justify-center">↑</button>
            <div></div>
            <button onClick={moveLeft} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-xs flex items-center justify-center">←</button>
            <div className="w-8 h-8"></div>
            <button onClick={moveRight} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-xs flex items-center justify-center">→</button>
            <div></div>
            <button onClick={moveDown} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-xs flex items-center justify-center">↓</button>
            <div></div>
          </div>
        </div>

        {/* 줌 컨트롤 */}
        <div className="mb-3">
          <div className="text-xs text-gray-600 mb-2">줌</div>
          <div className="flex gap-1">
            <button onClick={zoomOut} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">줌 -</button>
            <button onClick={zoomIn} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">줌 +</button>
          </div>
        </div>

        {/* 연도 점프 */}
        <div>
          <div className="text-xs text-gray-600 mb-2">연도 이동</div>
          <div className="flex gap-1">
            <button onClick={() => moveToYear(currentYear - 1)} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">{currentYear - 1}</button>
            <button onClick={() => moveToYear(new Date().getFullYear())} className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded">{new Date().getFullYear()}</button>
            <button onClick={() => moveToYear(currentYear + 1)} className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded">{currentYear + 1}</button>
          </div>
        </div>
      </div>

      {/* 사용법 안내 - 성능 혁신 업데이트 */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-sm border border-gray-200 p-2 text-xs text-gray-600">
        <div className="font-medium mb-1">Timeline2D 성능 혁신 🚀</div>
        <div>• 단일 쿼리 배치 로딩: 366개 → 1개 API 호출</div>
        <div>• 초고속 캐싱: 즉시 재접근</div>
        <div>• 스마트 프리로딩: 필요한 일기만 미리 로딩</div>
        <div>• 드래그: 자유 이동</div>
        <div>• 휠: 부드러운 줌</div>
      </div>

      {/* 2D 타임라인 그리드 */}
      <div
        ref={containerRef}
        className={`w-full h-full cursor-grab active:cursor-grabbing ${
          isAnimating ? 'transition-transform duration-300 ease-out' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        <div className="p-8">
          {/* 월 라벨 (수평 상단) */}
          <div className="flex mb-2 sticky top-0 bg-gray-50 z-30 border-b border-gray-300">
            <div className="w-16 bg-gray-50 border-r border-gray-300"></div>
            <div className="flex" style={{ width: `${(cellSize + gapSize) * maxDaysInYear}px` }}>
              {monthLabels.map((month, index) => {
                const monthStart = getMonthBoundaries(currentYear)[index] || 0
                const monthWidth = index < 11 
                  ? (getMonthBoundaries(currentYear)[index + 1] || maxDaysInYear) - monthStart
                  : maxDaysInYear - monthStart
                
                return (
                  <div
                    key={month}
                    className="text-xs font-medium text-gray-700 text-center border-r border-gray-300 flex items-center justify-center bg-gray-50"
                    style={{ 
                      width: `${monthWidth * (cellSize + gapSize)}px`,
                      height: '24px'
                    }}
                  >
                    {month}
                  </div>
                )
              })}
            </div>
          </div>

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
                    const hasData = hasDataForDateOptimized(date)
                    const isToday = isSameDay(date, new Date())
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6
                    
                    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                    const diary = hasData ? getDiaryOptimized(date) : null
                    const showContent = cellSize >= 20
                    
                    return (
                      <div
                        key={dayIndex}
                        ref={isToday ? todayCellRef : undefined}
                        className={`cursor-pointer transition-all duration-150 border relative overflow-hidden ${
                          isSelected
                            ? 'bg-primary-600 border-primary-700 shadow-md z-30'
                            : hasData
                            ? 'bg-primary-200 hover:bg-primary-300 border-primary-300'
                            : isToday
                            ? 'bg-yellow-400 hover:bg-yellow-500 border-yellow-500 shadow-sm'
                            : isWeekend
                            ? 'bg-gray-100 hover:bg-gray-200 border-gray-200'
                            : 'bg-white hover:bg-gray-100 border-gray-200'
                        }`}
                        style={{
                          width: `${cellSize}px`,
                          height: `${cellSize}px`,
                          marginRight: `${gapSize}px`,
                        }}
                        onClick={() => handleDateClick(date)}
                        title={`${format(date, 'yyyy년 MM월 dd일')}${diary ? ` - ${diary.title}` : ''}`}
                      >
                        {/* 큰 줌에서 내용 표시 */}
                        {showContent && diary && (
                          <div className="p-1 w-full h-full text-xs leading-tight">
                            <div className="font-medium text-gray-900 truncate text-[8px] mb-1">
                              {diary.title}
                            </div>
                            {cellSize >= 30 && diary?.content && (
                              <div className="text-gray-700 text-[6px] leading-none overflow-hidden">
                                {diary.content.substring(0, Math.floor(cellSize / 3))}
                              </div>
                            )}
                            {cellSize >= 25 && diary.mood && (
                              <div className="absolute bottom-0 right-0 text-[8px]">
                                {{'great': '😊', 'good': '😌', 'neutral': '😐', 'bad': '😞', 'terrible': '😢'}[diary.mood]}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* 작은 줌에서는 날짜만 표시 */}
                        {showContent && !diary && cellSize >= 20 && (
                          <div className="p-1 text-[8px] text-gray-600 font-medium">
                            {format(date, 'd')}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 범례 */}
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
            🚀 단일 쿼리로 연도 전체 로딩<br/>
            ⚡ 366개 → 1개 API 호출로 성능 혁신<br/>
            💾 스마트 캐싱 + 선택적 프리로딩<br/>
            🔄 가시 영역 자동 데이터 로딩
          </div>
        </div>
      </div>

      {/* 선택된 날짜 정보 */}
      {selectedDate && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3 max-w-xs">
          <div className="text-sm font-medium text-gray-900">
            {format(selectedDate, 'yyyy년 MM월 dd일')}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {format(selectedDate, 'yyyy')}년 {getDayOfYear(selectedDate)}번째 날
          </div>
        </div>
      )}
    </div>
  )
}
