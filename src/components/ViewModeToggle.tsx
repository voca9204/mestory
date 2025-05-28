import { ViewColumnsIcon, QueueListIcon, TableCellsIcon } from '@heroicons/react/24/outline'

export type ViewMode = 'timeline' | 'table' | 'topic'

interface ViewModeToggleProps {
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onModeChange('timeline')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'timeline'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <ViewColumnsIcon className="w-4 h-4" />
        2D 뷰
      </button>
      
      <button
        onClick={() => onModeChange('table')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'table'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <TableCellsIcon className="w-4 h-4" />
        표 뷰
      </button>
      
      <button
        onClick={() => onModeChange('topic')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'topic'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <QueueListIcon className="w-4 h-4" />
        기전체
      </button>
    </div>
  )
}
