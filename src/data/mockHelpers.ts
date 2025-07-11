import { DiaryEntry, ContextData } from './mockTypes'
import { mockContextData } from './mockContextData'
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
const mockDiaryEntries = [
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

// 헬퍼 함수들
export const getDiaryByDate = (date: string): DiaryEntry | undefined => {
  return mockDiaryEntries.find(entry => entry.date === date)
}

export const getDiaryByDateObj = (date: Date): DiaryEntry | undefined => {
  // 시간대 문제 방지를 위한 로컬 날짜 문자열 생성
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return mockDiaryEntries.find(entry => entry.date === dateString)
}

export const getContextByDate = (date: string): ContextData | undefined => {
  return mockContextData.find(context => context.date === date)
}

export const getRecentDiaries = (limit: number = 5): DiaryEntry[] => {
  return mockDiaryEntries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export const getDiariesByDateRange = (startDate: string, endDate: string): DiaryEntry[] => {
  return mockDiaryEntries.filter(entry => {
    const entryDate = new Date(entry.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return entryDate >= start && entryDate <= end
  })
}

export const hasDataForDate = (date: Date): boolean => {
  // 시간대 문제 방지를 위한 로컬 날짜 문자열 생성
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return mockDiaryEntries.some(entry => entry.date === dateString)
}

export const getDiaryCountByMonth = (year: number, month: number): number => {
  return mockDiaryEntries.filter(entry => {
    const entryDate = new Date(entry.date)
    return entryDate.getFullYear() === year && entryDate.getMonth() === month - 1
  }).length
}