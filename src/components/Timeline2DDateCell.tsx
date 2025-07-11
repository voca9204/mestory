import { format, isSameDay } from 'date-fns'
import { forwardRef } from 'react'

interface Timeline2DDateCellProps {
  date: Date
  dayIndex: number
  cellSize: number
  gapSize: number
  hasData: boolean
  isSelected: boolean
  isToday: boolean
  isWeekend: boolean
  isHovered: boolean
  onDateClick: (date: Date) => void
  onDateMouseEnter: (date: Date, event: React.MouseEvent) => void
  onDateMouseLeave: () => void
}

export const Timeline2DDateCell = forwardRef<HTMLDivElement, Timeline2DDateCellProps>(
  ({ 
    date, 
    dayIndex, 
    cellSize, 
    gapSize,
    hasData,
    isSelected,
    isToday,
    isWeekend,
    isHovered,
    onDateClick,
    onDateMouseEnter,
    onDateMouseLeave
  }, ref) => {
    return (
      <div
        key={dayIndex}
        ref={ref}
        className={`cursor-pointer transition-all duration-150 border relative overflow-hidden ${
          isSelected
            ? 'bg-primary-600 border-primary-700 shadow-md z-30'
            : hasData
            ? isHovered
              ? 'bg-primary-400 border-primary-500 shadow-md z-20'
              : 'bg-primary-200 hover:bg-primary-300 border-primary-300'
            : isToday
            ? 'bg-yellow-400 hover:bg-yellow-500 border-yellow-500 shadow-sm'
            : isWeekend
            ? 'bg-gray-100 hover:bg-gray-200 border-gray-200'
            : 'bg-white hover:bg-gray-50 border-gray-300'
        }`}
        style={{
          width: `${cellSize}px`,
          height: `${cellSize}px`,
          marginRight: `${gapSize}px`,
          marginBottom: `${gapSize}px`
        }}
        onClick={(e) => {
          e.stopPropagation()
          onDateClick(date)
        }}
        onMouseEnter={(e) => {
          e.stopPropagation()
          onDateMouseEnter(date, e)
        }}
        onMouseLeave={(e) => {
          e.stopPropagation()
          onDateMouseLeave()
        }}
        title={hasData ? '' : `${format(date, 'yyyy년 MM월 dd일')}`}
        data-date={format(date, 'yyyy-MM-dd')}
        data-has-data={hasData.toString()}
      >
        {/* 큰 줌에서만 날짜 표시 */}
        {cellSize >= 20 && (
          <div className="p-1 text-[8px] text-gray-600 font-medium">
            {format(date, 'd')}
          </div>
        )}
        
        {/* 일기 있음 표시 */}
        {hasData && cellSize >= 16 && (
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>
    )
  }
)

Timeline2DDateCell.displayName = 'Timeline2DDateCell'