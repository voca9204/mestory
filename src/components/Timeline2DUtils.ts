import { getDayOfYear } from 'date-fns'

// 툴팁 위치 계산 함수
export function calculateTooltipPosition(
  basePosition: { x: number, y: number },
  containerRect: DOMRect | null
): { x: number, y: number } {
  if (!containerRect) return basePosition
  
  const tooltipWidth = 320
  const tooltipHeight = 250
  const padding = 20
  
  // 컨테이너 상대 위치를 화면 절대 위치로 변환
  const screenX = containerRect.left + basePosition.x
  const screenY = containerRect.top + basePosition.y
  
  let x = screenX + 15 // 마우스에서 약간 오른쪽
  let y = screenY - tooltipHeight - 10 // 마우스 위쪽
  
  // 오른쪽 경계 확인
  if (x + tooltipWidth > window.innerWidth - padding) {
    x = screenX - tooltipWidth - 15
  }
  
  // 위쪽 경계 확인
  if (y < padding) {
    y = screenY + 25 // 마우스 아래쪽으로 이동
  }
  
  // 아래쪽 경계 확인
  if (y + tooltipHeight > window.innerHeight - padding) {
    y = window.innerHeight - tooltipHeight - padding
  }
  
  return { x: Math.max(padding, x), y: Math.max(padding, y) }
}

// 월별 구분선 위치 계산
export function getMonthBoundaries(year: number): number[] {
  const boundaries = []
  for (let month = 0; month < 12; month++) {
    const firstDay = new Date(year, month, 1)
    const dayOfYear = getDayOfYear(firstDay)
    boundaries.push(dayOfYear - 1)
  }
  return boundaries
}

// 날짜가 주말인지 확인
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

// 그리드 설정 기본값
export const DEFAULT_GRID_CONFIG = {
  cellSize: 12,
  gapSize: 1,
  monthLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
  maxDaysInYear: 366
}

// 이동 스텝 상수
export const NAVIGATION = {
  MOVE_STEP: 100,
  MIN_SCALE: 1.5,
  MAX_SCALE: 4,
  ZOOM_FACTOR: 1.2,
  WHEEL_ZOOM_FACTOR: 0.05
}

// 캔버스 설정
export const CANVAS_CONFIG = {
  PADDING: 32,
  HEADER_HEIGHT: 26,
  YEAR_LABEL_WIDTH: 100,
  MONTH_HEADER_OFFSET: 20
}