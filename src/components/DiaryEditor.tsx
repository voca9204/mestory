import { useState } from 'react'
import { 
  BoldIcon, 
  ItalicIcon, 
  ListBulletIcon,
  NumberedListIcon
} from '@heroicons/react/24/outline'

interface DiaryEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function DiaryEditor({ content, onChange, placeholder }: DiaryEditorProps) {
  const [isToolbarVisible, setIsToolbarVisible] = useState(false)

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const handleFocus = () => {
    setIsToolbarVisible(true)
  }

  const handleBlur = () => {
    // 약간의 지연을 두어 툴바 버튼 클릭이 가능하도록 함
    setTimeout(() => {
      setIsToolbarVisible(false)
    }, 200)
  }

  // 간단한 텍스트 포맷팅 함수들
  const insertText = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = content
    const newText = text.substring(0, start) + before + text.substring(start, end) + after + text.substring(end)
    onChange(newText)
    
    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const formatBold = () => insertText('**', '**')
  const formatItalic = () => insertText('*', '*')
  const formatBulletList = () => insertText('- ')
  const formatNumberedList = () => insertText('1. ')

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
      {/* 툴바 */}
      {isToolbarVisible && (
        <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
          <button
            type="button"
            onClick={formatBold}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="굵게"
          >
            <BoldIcon className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={formatItalic}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="기울임"
          >
            <ItalicIcon className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <button
            type="button"
            onClick={formatBulletList}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="목록"
          >
            <ListBulletIcon className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={formatNumberedList}
            className="p-2 hover:bg-gray-200 rounded-md"
            title="번호 목록"
          >
            <NumberedListIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 텍스트 영역 */}
      <textarea
        value={content}
        onChange={handleTextareaChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || "오늘 하루를 기록해보세요..."}
        className="w-full min-h-[300px] p-4 border-none resize-none focus:outline-none"
        style={{ fontFamily: 'inherit' }}
      />

      {/* 하단 정보 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
        <div>
          글자 수: {content.length}
        </div>
        
        <div className="flex items-center gap-4">
          <span>자동 저장됨</span>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}
