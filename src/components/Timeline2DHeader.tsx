interface Timeline2DHeaderProps {
  cellSize: number
  gapSize: number
  maxDaysInYear: number
  monthLabels: string[]
  getMonthBoundaries: (year: number) => number[]
}

export function Timeline2DHeader({ 
  cellSize, 
  gapSize, 
  maxDaysInYear, 
  monthLabels,
  getMonthBoundaries 
}: Timeline2DHeaderProps) {
  const monthBoundaries = getMonthBoundaries(new Date().getFullYear())
  
  return (
    <div className="flex mb-2 sticky top-0 bg-gray-50 z-30 border-b border-gray-300">
      <div className="w-16 bg-gray-50 border-r border-gray-300"></div>
      <div className="flex" style={{ width: `${(cellSize + gapSize) * maxDaysInYear}px` }}>
        {monthLabels.map((month, index) => {
          const monthStart = index === 0 ? 0 : monthBoundaries[index - 1] + 1
          const monthEnd = monthBoundaries[index]
          const monthDays = monthEnd - monthStart + 1
          const monthWidth = monthDays * (cellSize + gapSize) - gapSize

          return (
            <div
              key={month}
              className="text-center text-xs font-medium text-gray-700 py-1 border-r border-gray-300"
              style={{ 
                width: `${monthWidth}px`,
                marginRight: `${gapSize}px`
              }}
            >
              {month}월
            </div>
          )
        })}
      </div>
    </div>
  )
}