// 일기 조회를 위한 통합 인터페이스
import { DiaryEntry } from '../services/diaryService';

export interface UnifiedDiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  tags: string[];
  photos: string[];
  wordCount: number;
  createdAt: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface DataProviderInterface {
  isUsingMockData: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 읽기 함수들
  getDiaryByDate: (date: string) => Promise<UnifiedDiaryEntry | null>;
  getRecentDiaries: (count?: number) => Promise<UnifiedDiaryEntry[]>;
  getDiariesByDateRange: (startDate: string, endDate: string) => Promise<UnifiedDiaryEntry[]>;
  hasDataForDate: (date: Date) => Promise<boolean>;
  getDiaryCountByMonth: (year: number, month: number) => Promise<number>;
  getDatesWithData: (startDate: string, endDate: string) => Promise<string[]>;
  getContextByDate: (date: string) => any;
  
  // 쓰기 함수들 (로그인 시에만 사용 가능)
  createDiary: (title: string, content: string, date: string, mood?: string, tags?: string[]) => Promise<string>;
  updateDiary: (diaryId: string, updates: Partial<UnifiedDiaryEntry>) => Promise<void>;
  deleteDiary: (diaryId: string) => Promise<void>;
}
