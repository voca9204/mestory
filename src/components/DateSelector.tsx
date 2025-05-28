import { CalendarIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'

interface DateSelectorProps {
  selectedDate: Date | null
  onDateChange: (date: Date | null) => void
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onDateChange(new Date(e.target.value))
    } else {
      onDateChange(null)
    }
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
          onChange={handleDateInputChange}
          className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      
      <button
        onClick={goToToday}
        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
      >
        오늘
      </button>
    </div>
  )
}
