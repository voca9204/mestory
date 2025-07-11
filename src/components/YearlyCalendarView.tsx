import { useMemo, useState, useCallback, useRef, useEffect } from 'react'
import { eachDayOfInterval, isSameDay, format } from 'date-fns'
import { UnifiedDiaryEntry } from '../types/dataTypes'

interface YearlyCalendarViewProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  currentYear: number  // TableTimeline에서 전달받은 현재 연도
  diaryEntries: UnifiedDiaryEntry[]  // TableTimeline에서 전달받은 일기 데이터
  scrollOnSelect?: boolean  // 날짜 선택 시 스크롤 여부
}

// 호버 툴팁 컴포넌트
function HoverTooltip({ diary, position }: { diary: UnifiedDiaryEntry | null, position: { x: number, y: number } | null }) {
  if (!diary || !position) return null

  return (
    <div 
      className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-xs animate-fadeIn pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{diary.title}</h4>
          {diary.mood && (
            <span className="text-sm flex-shrink-0">
              {{'great': '😊', 'good': '😌', 'neutral': '😐', 'bad': '😞', 'terrible': '😢'}[diary.mood]}
            </span>
          )}
        </div>
        
        <p className="text-xs text-gray-600 line-clamp-3">{diary.content}</p>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {diary.photos && diary.photos.length > 0 && (
            <span className="flex items-center gap-1">
              📷 {diary.photos.length}장
            </span>
          )}
          {diary.tags && diary.tags.length > 0 && (
            <span className="flex items-center gap-1">
              🏷️ {diary.tags.slice(0, 2).join(', ')}
            </span>
          )}
          <span className="ml-auto">{diary.wordCount}자</span>
        </div>
      </div>
    </div>
  )
}

// 월별 캘린더 컴포넌트
function MonthCalendar({ 
  year, 
  month, 
  selectedDate, 
  onDateSelect,
  diariesByDate,
  onHoverDate,
  onLeaveDate
}: {
  year: number
  month: number
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
  diariesByDate: Map<string, UnifiedDiaryEntry>
  onHoverDate: (date: Date, diary: UnifiedDiaryEntry, element: HTMLElement) => void
  onLeaveDate: () => void
}) {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)
  const startDay = monthStart.getDay()
  
  const days = eachDayOfInterval({
    start: monthStart,
    end: monthEnd
  })
  
  const weeks = []
  let week = new Array(startDay).fill(null)
  
  days.forEach((day, index) => {
    week.push(day)
    if (week.length === 7 || index === days.length - 1) {
      while (week.length < 7) {
        week.push(null)
      }
      weeks.push(week)
      week = []
    }
  })
  
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">
        {monthNames[month]}
      </h3>
      
      <div className="grid grid-cols-7 gap-1 text-xs">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
          <div key={day} className={`text-center font-medium p-1 ${
            i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'
          }`}>
            {day}
          </div>
        ))}
        
        {weeks.map((week, weekIndex) => (
          week.map((day, dayIndex) => {
            const dateKey = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}` : ''
            const diary = dateKey ? diariesByDate.get(dateKey) : undefined
            const hasDiary = !!diary
            const isToday = day ? isSameDay(day, new Date()) : false
            const isSelected = day && selectedDate ? isSameDay(day, selectedDate) : false
            
            return (
              <button
                key={`${weekIndex}-${dayIndex}`}
                onClick={() => day && onDateSelect(day)}
                onMouseEnter={(e) => {
                  if (day && diary) {
                    onHoverDate(day, diary, e.currentTarget)
                  }
                }}
                onMouseLeave={onLeaveDate}
                disabled={!day}
                className={`
                  aspect-square p-1 text-sm rounded-md transition-all relative
                  ${!day ? 'invisible' : ''}
                  ${hasDiary ? 'bg-green-100 hover:bg-green-200 font-medium' : 'hover:bg-gray-100'}
                  ${isToday ? 'ring-2 ring-blue-500' : ''}
                  ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                  ${dayIndex === 0 && !isSelected ? 'text-red-500' : ''}
                  ${dayIndex === 6 && !isSelected ? 'text-blue-600' : ''}
                `}
              >
                {day?.getDate()}
                {hasDiary && !isSelected && (
                  <span className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></span>
                )}
              </button>
            )
          })
        ))}
      </div>
    </div>
  )
}

export function YearlyCalendarView({ selectedDate, onDateSelect, currentYear, diaryEntries, scrollOnSelect = true }: YearlyCalendarViewProps) {
  const [hoveredDiary, setHoveredDiary] = useState<UnifiedDiaryEntry | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // 일기 데이터를 날짜별로 매핑 (전체 일기 정보 저장)
  const diariesByDate = useMemo(() => {
    const dateMap = new Map<string, UnifiedDiaryEntry>()
    diaryEntries.forEach(diary => {
      dateMap.set(diary.date, diary)
    })
    return dateMap
  }, [diaryEntries])
  
  // 호버 핸들러
  const handleHoverDate = useCallback((date: Date, diary: UnifiedDiaryEntry, element: HTMLElement) => {
    // 기존 타이머 취소
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    
    // 300ms 디바운스
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = element.getBoundingClientRect()
      const tooltipX = rect.left + rect.width / 2
      const tooltipY = rect.top - 10
      
      // 화면 경계 체크
      const adjustedX = Math.min(tooltipX, window.innerWidth - 320) // 툴팁 최대 너비 320px
      const adjustedY = tooltipY < 100 ? rect.bottom + 10 : tooltipY
      
      setHoveredDiary(diary)
      setTooltipPosition({ x: adjustedX, y: adjustedY })
    }, 300)
  }, [])
  
  // 호버 종료 핸들러
  const handleLeaveDate = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setHoveredDiary(null)
    setTooltipPosition(null)
  }, [])
  
  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])
  
  // 날짜 선택 핸들러 (스크롤 포함)
  const handleDateSelect = useCallback((date: Date) => {
    console.log('Date selected:', date)
    onDateSelect(date)
    
    // 날짜 선택 시 하단 패널로 스크롤
    if (scrollOnSelect) {
      console.log('Attempting to scroll...')
      // requestAnimationFrame을 사용하여 DOM 업데이트 후 스크롤
      requestAnimationFrame(() => {
        setTimeout(() => {
          const detailPanel = document.getElementById('date-detail-panel')
          console.log('Detail panel found:', !!detailPanel)
          if (detailPanel) {
            const yOffset = -80 // 네비게이션 바 높이 고려
            const y = detailPanel.getBoundingClientRect().top + window.pageYOffset + yOffset
            console.log('Scrolling to:', y)
            window.scrollTo({ top: y, behavior: 'smooth' })
          }
        }, 150) // 상태 업데이트를 위한 충분한 시간
      })
    }
  }, [onDateSelect, scrollOnSelect])
  
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, i) => (
          <MonthCalendar
            key={i}
            year={currentYear}
            month={i}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            diariesByDate={diariesByDate}
            onHoverDate={handleHoverDate}
            onLeaveDate={handleLeaveDate}
          />
        ))}
      </div>
      
      {/* 범례 */}
      <div className="mt-6 flex justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span>일기 있음</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 ring-2 ring-blue-500 rounded"></div>
          <span>오늘</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>선택된 날짜</span>
        </div>
      </div>
      
      {/* 호버 툴팁 */}
      <HoverTooltip diary={hoveredDiary} position={tooltipPosition} />
    </div>
  )
}
