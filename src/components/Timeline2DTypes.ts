export interface Timeline2DProps {
  selectedDate: Date | null
  onDateSelect: (date: Date) => void
}

export interface TooltipData {
  date: Date
  diary: any
  position: { x: number, y: number }
}

export interface DragState {
  isDragging: boolean
  lastX: number
  lastY: number
}

export interface Offset {
  x: number
  y: number
}

export interface GridConfig {
  cellSize: number
  gapSize: number
  monthLabels: string[]
  maxDaysInYear: number
}