import { Link } from 'react-router-dom'
import { CalendarIcon, BookOpenIcon, ChartBarIcon, CogIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useData } from '../contexts/DataContext'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'

export function HomePage() {
  const { getRecentDiaries, isUsingMockData, isLoading, error } = useData()
  const [recentDiaries, setRecentDiaries] = useState<any[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<{ diaryId: string, photoIndex: number, photos: string[] } | null>(null)

  // 최근 일기 데이터 로드
  useEffect(() => {
    const loadRecentDiaries = async () => {
      try {
        const diaries = await getRecentDiaries(5)
        setRecentDiaries(diaries)
      } catch (err) {
        console.error('최근 일기 로드 실패:', err)
      }
    }
    
    loadRecentDiaries()
  }, [getRecentDiaries, isUsingMockData])

  // 사진 모달 관련 함수들
  const openPhotoModal = (diaryId: string, photoIndex: number, photos: string[]) => {
    setSelectedPhoto({ diaryId, photoIndex, photos })
  }

  const closePhotoModal = () => {
    setSelectedPhoto(null)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return
    
    if (direction === 'prev') {
      setSelectedPhoto({
        ...selectedPhoto,
        photoIndex: selectedPhoto.photoIndex > 0 ? selectedPhoto.photoIndex - 1 : selectedPhoto.photos.length - 1
      })
    } else {
      setSelectedPhoto({
        ...selectedPhoto,
        photoIndex: selectedPhoto.photoIndex < selectedPhoto.photos.length - 1 ? selectedPhoto.photoIndex + 1 : 0
      })
    }
  }

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return
      
      switch (e.key) {
        case 'Escape':
          closePhotoModal()
          break
        case 'ArrowLeft':
          navigatePhoto('prev')
          break
        case 'ArrowRight':
          navigatePhoto('next')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedPhoto])

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ME.STORY
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          100년 일기 - 나의 이야기를 완전히 기록하고 맥락화하는 공간
        </p>
        <Link
          to="/timeline"
          className="btn-primary inline-flex items-center gap-2"
        >
          <CalendarIcon className="w-5 h-5" />
          타임라인 보기
        </Link>
      </div>

      {/* Quick Access Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link to="/diary" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <BookOpenIcon className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold">오늘의 일기</h3>
          </div>
          <p className="text-gray-600">
            오늘 하루를 기록하고 사진을 추가해보세요
          </p>
        </Link>

        <Link to="/timeline" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <CalendarIcon className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold">2D 타임라인</h3>
          </div>
          <p className="text-gray-600">
            수평(월일) × 수직(연도) 네비게이션으로 과거 탐색
          </p>
        </Link>

        <Link to="/analytics" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <ChartBarIcon className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold">데이터 분석</h3>
          </div>
          <p className="text-gray-600">
            나의 패턴과 트렌드를 시각화해서 확인
          </p>
        </Link>

        <Link to="/settings" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-3">
            <CogIcon className="w-6 h-6 text-primary-600" />
            <h3 className="text-lg font-semibold">설정</h3>
          </div>
          <p className="text-gray-600">
            계정, 백업, 연동 설정 관리
          </p>
        </Link>
      </div>

      {/* Recent Entries Preview */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">최근 기록</h2>
        
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">최근 일기를 불러오는 중...</p>
          </div>
        )}
        
        {/* 에러 상태 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">오류가 발생했습니다</p>
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {/* 일기 목록 */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {recentDiaries.length > 0 ? (
              recentDiaries.map((diary) => (
              <div key={diary.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex gap-4">
                  {/* 사진 미리보기 */}
                  {diary.photos.length > 0 && (
                    <div className="flex-shrink-0">
                      <img
                        src={diary.photos[0]}
                        alt={`${diary.title} 대표 사진`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => openPhotoModal(diary.id, 0, diary.photos)}
                      />
                      {diary.photos.length > 1 && (
                        <div className="text-xs text-gray-500 text-center mt-1">
                          +{diary.photos.length - 1}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 일기 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(diary.date), 'yyyy.MM.dd')}
                      </span>
                      {diary.mood && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          diary.mood === 'great' ? 'bg-green-100 text-green-700' :
                          diary.mood === 'good' ? 'bg-blue-100 text-blue-700' :
                          diary.mood === 'neutral' ? 'bg-gray-100 text-gray-700' :
                          diary.mood === 'bad' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {diary.mood === 'great' ? '😊' :
                           diary.mood === 'good' ? '🙂' :
                           diary.mood === 'neutral' ? '😐' :
                           diary.mood === 'bad' ? '😕' : '😢'}
                        </span>
                      )}
                      {diary.photos.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                          📷 {diary.photos.length}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">{diary.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {diary.content.length > 100 
                        ? diary.content.substring(0, 100) + '...' 
                        : diary.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {diary.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <Link 
                        to={`/diary/${diary.date}`} 
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        자세히 보기 →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {isUsingMockData 
                ? "아직 기록이 없습니다. 첫 일기를 작성해보세요!" 
                : "아직 작성한 일기가 없습니다. 첫 일기를 작성해보세요!"}
            </div>
          )}
        </div>
        )}

        {recentDiaries.length > 0 && !isLoading && !error && (
          <div className="mt-6 text-center">
            <Link 
              to="/timeline" 
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              모든 기록 보기 →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
