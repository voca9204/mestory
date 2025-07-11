import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timeline2D } from '../components/Timeline2D'
import { TableTimeline } from '../components/TableTimeline'
import { DateSelector } from '../components/DateSelector'
import { ViewModeToggle, ViewMode } from '../components/ViewModeToggle'
import { useData } from '../contexts/DataContext'
import { format } from 'date-fns'

export function TimelinePage() {
  const navigate = useNavigate()
  const { getDiaryByDate, getContextByDate } = useData()
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()) // 오늘 날짜로 초기화
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [selectedDiary, setSelectedDiary] = useState<any>(null)
  const [selectedContext, setSelectedContext] = useState<any>(null)

  // 선택된 날짜가 변경될 때마다 해당 날짜의 데이터 로드
  useEffect(() => {
    const loadDateData = async () => {
      if (selectedDate) {
        const dateString = format(selectedDate, 'yyyy-MM-dd')
        try {
          const [diary, context] = await Promise.all([
            getDiaryByDate(dateString),
            Promise.resolve(getContextByDate(dateString)) // getContextByDate는 sync 함수
          ])
          setSelectedDiary(diary)
          setSelectedContext(context)
        } catch (error) {
          console.error('날짜 데이터 로드 실패:', error)
          setSelectedDiary(null)
          setSelectedContext(null)
        }
      } else {
        setSelectedDiary(null)
        setSelectedContext(null)
      }
    }
    
    loadDateData()
  }, [selectedDate, getDiaryByDate, getContextByDate])

  return (
    <div className="max-w-full">
      {/* Header Controls */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {viewMode === 'timeline' ? '2D 타임라인' : 
           viewMode === 'table' ? '표 뷰' : 
           '기전체 뷰'}
        </h1>
        
        <div className="flex items-center gap-4">
          <DateSelector 
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <ViewModeToggle 
            mode={viewMode}
            onModeChange={setViewMode}
          />
        </div>
      </div>

      {/* Timeline View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {viewMode === 'timeline' ? (
          <div className="p-4">
            <Timeline2D 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
        ) : viewMode === 'table' ? (
          <TableTimeline 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        ) : (
          <div className="text-center py-20 text-gray-500">
            <h3 className="text-lg font-medium mb-2">기전체 뷰</h3>
            <p>토픽별 히스토리 뷰는 추후 구현될 예정입니다.</p>
          </div>
        )}
      </div>

      {/* Date Detail Panel */}
      {selectedDate && (
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {selectedDate.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
            </h2>
            {selectedDiary && (
              <span className={`text-xs px-3 py-1 rounded-full ${
                selectedDiary.mood === 'great' ? 'bg-green-100 text-green-700' :
                selectedDiary.mood === 'good' ? 'bg-blue-100 text-blue-700' :
                selectedDiary.mood === 'neutral' ? 'bg-gray-100 text-gray-700' :
                selectedDiary.mood === 'bad' ? 'bg-yellow-100 text-yellow-700' :
                selectedDiary.mood === 'terrible' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {selectedDiary.mood === 'great' ? '😊 Great' :
                 selectedDiary.mood === 'good' ? '🙂 Good' :
                 selectedDiary.mood === 'neutral' ? '😐 Neutral' :
                 selectedDiary.mood === 'bad' ? '😕 Bad' :
                 selectedDiary.mood === 'terrible' ? '😢 Terrible' : '😐 No mood'}
              </span>
            )}
          </div>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Personal Records */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">개인 기록</h3>
              <div className="space-y-3">
                {selectedDiary ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{selectedDiary.title}</h4>
                      <span className="text-xs text-gray-500">{selectedDiary.wordCount}자</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3 mb-3">
                      {selectedDiary.content}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-600">
                          사진: <span className="font-medium">{selectedDiary.photos.length}장</span>
                        </span>
                        {selectedDiary.tags.length > 0 && (
                          <div className="flex gap-1">
                            {selectedDiary.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={() => navigate(`/diary/${selectedDiary.date}`)}
                        className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
                      >
                        자세히 보기 →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">일기</span>
                      <span className="text-gray-400">미작성</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">사진</span>
                      <span className="text-gray-400">0장</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">운동</span>
                      <span className="text-gray-400">기록 없음</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Context Data */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">맥락 정보</h3>
              <div className="space-y-3">
                {selectedContext ? (
                  <>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">날씨</span>
                        <span className="text-xs text-blue-600">{selectedContext.weather.condition}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {selectedContext.weather.temperature}°C, 습도 {selectedContext.weather.humidity}%
                      </div>
                    </div>
                    
                    {selectedContext.news.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">주요 뉴스</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {selectedContext.news.slice(0, 2).map((news, index) => (
                            <li key={index} className="text-xs">• {news}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedContext.events.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-700 mb-2">특별한 일</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {selectedContext.events.map((event, index) => (
                            <li key={index} className="text-xs">🎉 {event}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">날씨</span>
                      <span className="text-gray-400">정보 없음</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">주요 뉴스</span>
                      <span className="text-gray-400">정보 없음</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
