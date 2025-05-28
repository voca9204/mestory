import { useState, useMemo, useEffect } from 'react'
import { format, eachDayOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, isSameDay } from 'date-fns'
import { useData } from '../contexts/DataContext'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { UnifiedDiaryEntry } from '../types/dataTypes'

interface TableTimelineProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
}

type ViewMode = 'month' | 'year' | 'all'

export function TableTimeline({ selectedDate, onDateSelect }: TableTimelineProps) {
  const { isUsingMockData, getDiaryByDate, getDiariesByDateRange } = useData()
  const [currentDate, setCurrentDate] = useState(new Date()) // 오늘 날짜로 초기화
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [diaryEntries, setDiaryEntries] = useState<UnifiedDiaryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 현재 표시 범위의 일기들을 로딩하는 함수
  const loadDiaries = async () => {
    setIsLoading(true)
    try {
      let startDate: string, endDate: string

      switch (viewMode) {
        case 'month':
          const monthStart = startOfMonth(currentDate)
          const monthEnd = endOfMonth(currentDate)
          startDate = format(monthStart, 'yyyy-MM-dd')
          endDate = format(monthEnd, 'yyyy-MM-dd')
          break
        case 'year':
          const yearStart = startOfYear(currentDate)
          const yearEnd = endOfYear(currentDate)
          startDate = format(yearStart, 'yyyy-MM-dd')
          endDate = format(yearEnd, 'yyyy-MM-dd')
          break
        case 'all':
          // 전체 범위를 위해 넓은 범위 설정
          startDate = '2020-01-01'
          endDate = '2030-12-31'
          break
        default:
          startDate = format(new Date(), 'yyyy-MM-dd')
          endDate = format(new Date(), 'yyyy-MM-dd')
      }

      const entries = await getDiariesByDateRange(startDate, endDate)
      setDiaryEntries(entries)
    } catch (error) {
      console.error('일기 로딩 실패:', error)
      setDiaryEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  // viewMode나 currentDate가 변경될 때마다 데이터 다시 로딩
  useEffect(() => {
    loadDiaries()
  }, [viewMode, currentDate, isUsingMockData])

  // 초기 로드 시 오늘 날짜 선택
  useEffect(() => {
    if (!selectedDate) {
      onDateSelect(new Date())
    }
  }, [])

  // 표시할 날짜들 계산
  const dates = useMemo(() => {
    switch (viewMode) {
      case 'month':
        return eachDayOfInterval({
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        })
      case 'year':
        // 년도별로는 각 달의 첫날만 표시
        const yearStart = startOfYear(currentDate)
        return Array.from({ length: 12 }, (_, i) => {
          const monthDate = new Date(yearStart.getFullYear(), i, 1)
          return monthDate
        })
      case 'all':
        // 모든 일기가 있는 날짜들만 표시
        return diaryEntries.map(diary => new Date(diary.date)).sort((a, b) => b.getTime() - a.getTime())
      default:
        return []
    }
  }, [currentDate, viewMode, diaryEntries])

  // 이전/다음 이동
  const navigatePrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    } else if (viewMode === 'year') {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1))
    }
  }

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    } else if (viewMode === 'year') {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1))
    }
  }

  // 월별 뷰에서 주 단위로 그룹화 (달력 형태)
  const weekGroups = useMemo(() => {
    if (viewMode !== 'month') return []
    
    const weeks = []
    const firstDay = dates[0] // 월의 첫 날
    const lastDay = dates[dates.length - 1] // 월의 마지막 날
    
    // 첫 주의 시작일 (월의 첫 날이 속한 주의 일요일)
    const firstSunday = new Date(firstDay)
    firstSunday.setDate(firstDay.getDate() - firstDay.getDay())
    
    // 마지막 주의 끝일 (월의 마지막 날이 속한 주의 토요일)
    const lastSaturday = new Date(lastDay)
    lastSaturday.setDate(lastDay.getDate() + (6 - lastDay.getDay()))
    
    // 주 단위로 그룹화
    let currentDate = new Date(firstSunday)
    
    while (currentDate <= lastSaturday) {
      const week = []
      
      for (let i = 0; i < 7; i++) {
        const cellDate = new Date(currentDate)
        
        // 현재 월에 속하는 날짜만 추가, 다른 월은 null
        if (cellDate.getMonth() === firstDay.getMonth()) {
          week.push(cellDate)
        } else {
          week.push(null)
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      weeks.push(week)
    }
    
    return weeks
  }, [dates, viewMode])

  return (
    <div className="w-full">
      {/* 컨트롤 패널 */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          {/* 뷰 모드 선택 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'month', label: '월별' },
              { key: 'year', label: '년별' },
              { key: 'all', label: '전체' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key as ViewMode)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === key
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 현재 기간 표시 */}
          <div className="text-lg font-semibold text-gray-900">
            {viewMode === 'month' && format(currentDate, 'yyyy년 M월')}
            {viewMode === 'year' && format(currentDate, 'yyyy년')}
            {viewMode === 'all' && '전체 일기'}
          </div>
        </div>

        {/* 이전/다음 버튼 */}
        {viewMode !== 'all' && (
          <div className="flex items-center gap-2">
            <button
              onClick={navigatePrevious}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <button
              onClick={navigateNext}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              오늘
            </button>
          </div>
        )}
      </div>

      {/* 표 뷰 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600">일기를 불러오는 중...</span>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'month' && (
          <div>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                <div key={day} className={`p-3 text-center text-sm font-medium ${
                  index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {day}
                </div>
              ))}
            </div>

            {/* 주별 행 */}
            {weekGroups.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
                {week.map((date, dayIndex) => {
                  // 시간대 문제 방지를 위한 로컬 날짜 문자열 생성
                  const dateString = date ? 
                    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : 
                    null
                  
                  // diaryEntries에서 해당 날짜의 일기 찾기
                  const diary = dateString ? diaryEntries.find(entry => entry.date === dateString) : null
                  const isToday = date ? isSameDay(date, new Date()) : false
                  const isSelected = date && selectedDate ? isSameDay(date, selectedDate) : false

                  return (
                    <div
                      key={dayIndex}
                      className={`min-h-[120px] p-2 border-r border-gray-100 last:border-r-0 transition-colors ${
                        !date ? 'bg-gray-50' :
                        isSelected ? 'bg-blue-50 ring-2 ring-blue-500' :
                        isToday ? 'bg-yellow-50' :
                        diary ? 'bg-green-50 hover:bg-green-100 cursor-pointer' :
                        'hover:bg-gray-50 cursor-pointer'
                      }`}
                      onClick={() => date && onDateSelect(date)}
                    >
                      {date && (
                        <>
                          {/* 날짜 */}
                          <div className={`text-sm font-medium mb-1 ${
                            isToday ? 'text-yellow-700' :
                            dayIndex === 0 ? 'text-red-600' :
                            dayIndex === 6 ? 'text-blue-600' :
                            'text-gray-700'
                          }`}>
                            {format(date, 'd')}
                          </div>

                          {/* 일기 내용 */}
                          {diary && (
                            <div className="space-y-1">
                              <div className="text-xs font-medium text-gray-900 line-clamp-1">
                                {diary.title}
                              </div>
                              <div className="text-xs text-gray-600 line-clamp-3">
                                {diary.content}
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                {diary.mood && (
                                  <span className="text-xs">
                                    {{'great': '😊', 'good': '😌', 'neutral': '😐', 'bad': '😞', 'terrible': '😢'}[diary.mood]}
                                  </span>
                                )}
                                {diary.photos?.length > 0 && (
                                  <span className="text-xs text-purple-600">📷{diary.photos.length}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'year' && (
          <div className="grid grid-cols-4 gap-px">
            {dates.map((date, index) => {
              const monthDiaries = diaryEntries.filter(diary => {
                const diaryDate = new Date(diary.date)
                return diaryDate.getFullYear() === date.getFullYear() && 
                       diaryDate.getMonth() === date.getMonth()
              })

              return (
                <div
                  key={index}
                  className="p-4 border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setCurrentDate(date)
                    setViewMode('month')
                  }}
                >
                  <div className="text-sm font-medium text-gray-900 mb-2">
                    {format(date, 'M월')}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {monthDiaries.length}개 기록
                  </div>
                  {monthDiaries.slice(0, 3).map((diary, diaryIndex) => (
                    <div key={diaryIndex} className="text-xs text-gray-500 line-clamp-1 mb-1">
                      • {diary.title}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {viewMode === 'all' && (
          <div className="divide-y divide-gray-100">
            {dates.map((date, index) => {
              // diaryEntries에서 해당 날짜의 일기 찾기
              const diary = diaryEntries.find(entry => entry.date === date.toISOString().split('T')[0])
              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false

              return (
                <div
                  key={index}
                  className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => onDateSelect(date)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-sm font-medium text-gray-900">
                          {format(date, 'yyyy년 M월 d일')}
                        </div>
                        {diary?.mood && (
                          <span className="text-sm">
                            {{'great': '😊', 'good': '😌', 'neutral': '😐', 'bad': '😞', 'terrible': '😢'}[diary.mood]}
                          </span>
                        )}
                        {diary?.photos?.length > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            📷 {diary.photos.length}
                          </span>
                        )}
                      </div>
                      
                      {diary && (
                        <>
                          <h3 className="text-base font-medium text-gray-900 mb-2">
                            {diary.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-3 mb-2">
                            {diary.content}
                          </p>
                          {diary.tags && diary.tags.length > 0 && (
                            <div className="flex gap-1">
                              {diary.tags.map(tag => (
                                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 ml-4">
                      {diary && format(new Date(diary.createdAt), 'HH:mm')}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}