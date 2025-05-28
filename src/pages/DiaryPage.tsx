import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { DiaryEditor } from '../components/DiaryEditor'
import { PhotoUpload } from '../components/PhotoUpload'
import { ChevronLeftIcon, CalendarIcon, XMarkIcon, ChevronLeftIcon as ArrowLeftIcon, ChevronRightIcon as ArrowRightIcon } from '@heroicons/react/24/outline'
import { useData } from '../contexts/DataContext'

export function DiaryPage() {
  const { 
    getDiaryByDate, 
    getContextByDate, 
    isUsingMockData,
    createDiary,
    updateDiary,
    deleteDiary,
    isLoading,
    error
  } = useData()
  const { date: dateParam } = useParams()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [content, setContent] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState<string>('neutral')
  const [tags, setTags] = useState<string[]>([])
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const [existingDiary, setExistingDiary] = useState<any>(null)
  const [isLoadingDiary, setIsLoadingDiary] = useState(false)
  
  // 날짜가 변경될 때 해당 날짜의 일기 데이터 불러오기
  useEffect(() => {
    if (dateParam) {
      const parsedDate = new Date(dateParam)
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate)
      }
    }
  }, [dateParam])

  // 선택된 날짜의 일기 데이터 불러오기 (Firebase 지원)
  useEffect(() => {
    const loadDiaryData = async () => {
      setIsLoadingDiary(true)
      const dateString = selectedDate.toISOString().split('T')[0]
      
      try {
        const diary = await getDiaryByDate(dateString)
        if (diary) {
          setExistingDiary(diary)
          setTitle(diary.title || '')
          setContent(diary.content || '')
          setMood(diary.mood || 'neutral')
          setTags(diary.tags || [])
          // 실제 구현에서는 photos도 로드해야 하지만, 현재는 URL만 있음
          setPhotos([])
        } else {
          setExistingDiary(null)
          setTitle('')
          setContent('')
          setMood('neutral')
          setTags([])
          setPhotos([])
        }
      } catch (error) {
        console.error('일기 데이터 로드 실패:', error)
        setExistingDiary(null)
        setTitle('')
        setContent('')
        setMood('neutral')
        setTags([])
        setPhotos([])
      } finally {
        setIsLoadingDiary(false)
      }
    }
    
    loadDiaryData()
  }, [selectedDate, getDiaryByDate])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    try {
      const dateString = selectedDate.toISOString().split('T')[0]
      
      if (existingDiary) {
        // 기존 일기 수정
        if (updateDiary) {
          await updateDiary(existingDiary.id, {
            title,
            content,
            mood: mood as any,
            tags
          })
          alert('일기가 수정되었습니다!')
        } else {
          alert('데모 모드에서는 일기를 수정할 수 없습니다. 로그인해주세요.')
        }
      } else {
        // 새 일기 생성
        if (createDiary) {
          await createDiary(title, content, dateString, mood, tags)
          alert('일기가 저장되었습니다!')
          // 생성 후 다시 로드
          const newDiary = await getDiaryByDate(dateString)
          setExistingDiary(newDiary)
        } else {
          alert('데모 모드에서는 일기를 저장할 수 없습니다. 로그인해주세요.')
        }
      }
    } catch (error: any) {
      console.error('일기 저장 실패:', error)
      alert(error.message || '일기 저장에 실패했습니다.')
    }
  }

  const handleDelete = async () => {
    if (!existingDiary) return
    
    if (!confirm('정말로 이 일기를 삭제하시겠습니까?')) return

    try {
      if (deleteDiary) {
        await deleteDiary(existingDiary.id)
        alert('일기가 삭제되었습니다.')
        // 삭제 후 초기화
        setExistingDiary(null)
        setTitle('')
        setContent('')
        setMood('neutral')
        setTags([])
        setPhotos([])
      } else {
        alert('데모 모드에서는 일기를 삭제할 수 없습니다. 로그인해주세요.')
      }
    } catch (error: any) {
      console.error('일기 삭제 실패:', error)
      alert(error.message || '일기 삭제에 실패했습니다.')
    }
  }

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate)
    const dateString = format(newDate, 'yyyy-MM-dd')
    navigate(`/diary/${dateString}`)
  }

  // 사진 모달 관련 함수들
  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index)
  }

  const closePhotoModal = () => {
    setSelectedPhotoIndex(null)
  }

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (!existingDiary?.photos || selectedPhotoIndex === null) return
    
    if (direction === 'prev') {
      setSelectedPhotoIndex(selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : existingDiary.photos.length - 1)
    } else {
      setSelectedPhotoIndex(selectedPhotoIndex < existingDiary.photos.length - 1 ? selectedPhotoIndex + 1 : 0)
    }
  }

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhotoIndex === null) return
      
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
  }, [selectedPhotoIndex])

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeftIcon className="w-5 h-5" />
          돌아가기
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-600" />
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => handleDateChange(new Date(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            {existingDiary && !isUsingMockData && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                삭제
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isLoading || isLoadingDiary}
              className="btn-primary disabled:opacity-50"
            >
              {isLoading ? '저장 중...' : (existingDiary ? '수정' : '저장')}
            </button>
          </div>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoadingDiary && (
        <div className="card mb-6 text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">일기를 불러오는 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">오류가 발생했습니다</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 데모 모드 안내 */}
      {isUsingMockData && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6">
          <p className="text-sm">
            <strong>데모 모드:</strong> 일기 저장/수정/삭제 기능을 사용하려면 Google 로그인을 해주세요.
          </p>
        </div>
      )}

      {/* Date Display */}
      {!isLoadingDiary && (
        <div className="card mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {format(selectedDate, 'yyyy년 M월 d일')}
          </h1>
          <p className="text-gray-600 mb-4">
            {format(selectedDate, 'EEEE')}
          </p>

          {/* 제목 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              일기 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="오늘의 제목을 입력하세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* 기분 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              오늘의 기분
            </label>
            <div className="flex gap-2">
              {[
                { value: 'great', emoji: '😊', label: '최고' },
                { value: 'good', emoji: '🙂', label: '좋음' },
                { value: 'neutral', emoji: '😐', label: '보통' },
                { value: 'bad', emoji: '😕', label: '나쁨' },
                { value: 'terrible', emoji: '😢', label: '최악' }
              ].map((moodOption) => (
                <button
                  key={moodOption.value}
                  onClick={() => setMood(moodOption.value)}
                  className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                    mood === moodOption.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {moodOption.emoji} {moodOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* 태그 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              태그 (쉼표로 구분)
            </label>
            <input
              type="text"
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
              placeholder="개발, 일상, 여행..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Diary Editor */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">일기 작성</h2>
            <DiaryEditor
              content={content}
              onChange={setContent}
              placeholder="오늘 하루는 어땠나요? 자유롭게 기록해보세요..."
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* 기존 일기 사진들 표시 */}
          {existingDiary && existingDiary.photos && existingDiary.photos.length > 0 && (
            <div className="card">
              <h3 className="font-medium mb-3">일기 사진 ({existingDiary.photos.length}장)</h3>
              <div className="grid grid-cols-1 gap-3">
                {existingDiary.photos.map((photoUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photoUrl}
                      alt={`일기 사진 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      onClick={() => openPhotoModal(index)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                      <span className="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                        크게 보기
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photo Upload */}
          <div className="card">
            <h3 className="font-medium mb-3">새 사진 추가</h3>
            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
            />
          </div>

          {/* Context Info */}
          <div className="card">
            <h3 className="font-medium mb-3">오늘의 맥락</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">날씨:</span>
                <span className="ml-2">
                  {existingDiary?.weather || '기록 없음'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">기분:</span>
                <span className="ml-2">
                  {existingDiary?.mood ? 
                    {'great': '😊 최고', 'good': '😌 좋음', 'neutral': '😐 보통', 'bad': '😞 안좋음', 'terrible': '😢 최악'}[existingDiary.mood] || '😐 보통'
                    : mood ? {'great': '😊 최고', 'good': '😌 좋음', 'neutral': '😐 보통', 'bad': '😞 안좋음', 'terrible': '😢 최악'}[mood] || '😐 보통' : '기록 없음'
                  }
                </span>
              </div>
              <div>
                <span className="text-gray-600">태그:</span>
                <div className="mt-1">
                  {(existingDiary?.tags || tags)?.length > 0 ? (
                    (existingDiary?.tags || tags).map(tag => (
                      <span key={tag} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">태그 없음</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="font-medium mb-3">통계</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">작성한 글자 수</span>
                <span className="font-medium">{content.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">첨부 사진</span>
                <span className="font-medium">{photos.length}장</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 사진 모달 */}
      {selectedPhotoIndex !== null && existingDiary?.photos && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closePhotoModal}
        >
          <div 
            className="relative max-w-4xl max-h-screen p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* 이전/다음 버튼 */}
            {existingDiary.photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigatePhoto('prev')
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                >
                  <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigatePhoto('next')
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                >
                  <ArrowRightIcon className="w-6 h-6" />
                </button>
              </>
            )}

            {/* 사진 */}
            <img
              src={existingDiary.photos[selectedPhotoIndex]}
              alt={`일기 사진 ${selectedPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />

            {/* 사진 정보 */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-3 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-medium">
                  {selectedPhotoIndex + 1} / {existingDiary.photos.length}
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  {format(selectedDate, 'yyyy년 M월 d일')} - {title}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  ESC: 닫기 | ←→: 이전/다음 사진
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
