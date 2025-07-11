// 타입 정의 export
export type { DiaryEntry, ContextData } from './mockTypes'

// 일기 데이터 import 및 병합
import { 
  mockDiaryEntries2025May,
  mockDiaryEntries2025MayMid,
  mockDiaryEntries2025April,
  mockDiaryEntries2025March,
  mockDiaryEntries2025Feb,
  mockDiaryEntries2025Jan
} from './mockDiaryData'

import {
  mockDiaryEntries2025MayExtra,
  mockDiaryEntries2024Dec,
  mockDiaryEntries2023
} from './mockDiaryData2'

import {
  mockDiaryEntriesTest
} from './mockDiaryData3'

// 모든 일기 데이터 통합
export const mockDiaryEntries = [
  ...mockDiaryEntries2025May,
  ...mockDiaryEntries2025MayMid,
  ...mockDiaryEntries2025MayExtra,
  ...mockDiaryEntries2025April,
  ...mockDiaryEntries2025March,
  ...mockDiaryEntries2025Feb,
  ...mockDiaryEntries2025Jan,
  ...mockDiaryEntriesTest,
  ...mockDiaryEntries2024Dec,
  ...mockDiaryEntries2023
]

// 맥락 데이터 export
export { mockContextData } from './mockContextData'

// 헬퍼 함수들 export
export {
  getDiaryByDate,
  getDiaryByDateObj,
  getContextByDate,
  getRecentDiaries,
  getDiariesByDateRange,
  hasDataForDate,
  getDiaryCountByMonth
} from './mockHelpers'