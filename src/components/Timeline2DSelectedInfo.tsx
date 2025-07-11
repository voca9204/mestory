import { format, getDayOfYear } from 'date-fns'

interface Timeline2DSelectedInfoProps {
  selectedDate: Date | null
}

export function Timeline2DSelectedInfo({ selectedDate }: Timeline2DSelectedInfoProps) {
  if (!selectedDate) return null
  
  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200 p-3 max-w-xs">
      <div className="text-sm font-medium text-gray-900">
        {format(selectedDate, 'yyyy년 MM월 dd일')}
      </div>
      <div className="text-xs text-gray-600 mt-1">
        {format(selectedDate, 'yyyy')}년 {getDayOfYear(selectedDate)}번째 날
      </div>
    </div>
  )
}