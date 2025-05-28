import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  mockDiaryEntries, 
  mockContextData, 
  getDiaryByDate as getMockDiaryByDate, 
  getContextByDate as getMockContextByDate, 
  getRecentDiaries as getMockRecentDiaries, 
  getDiariesByDateRange as getMockDiariesByDateRange, 
  hasDataForDate as mockHasDataForDate, 
  getDiaryCountByMonth as getMockDiaryCountByMonth 
} from '../data/mockData';
import DiaryService, { DiaryEntry } from '../services/diaryService';
import { UnifiedDiaryEntry, DataProviderInterface } from '../types/dataTypes';

const DataContext = createContext<DataProviderInterface | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { user, isAuthenticated, isDemoMode } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 데이터 소스 결정 로직
  const isUsingMockData = isDemoMode || !isAuthenticated;

  // Mock 데이터를 UnifiedDiaryEntry로 변환하는 함수
  const convertMockToUnified = (mockEntry: any): UnifiedDiaryEntry => ({
    id: mockEntry.id,
    date: mockEntry.date,
    title: mockEntry.title,
    content: mockEntry.content,
    mood: mockEntry.mood,
    tags: mockEntry.tags || [],
    photos: mockEntry.photos || [],
    wordCount: mockEntry.wordCount || mockEntry.content.length,
    createdAt: new Date(mockEntry.createdAt || mockEntry.date),
    updatedAt: new Date(mockEntry.updatedAt || mockEntry.date),
    userId: 'mock-user'
  });

  // Firebase 데이터를 UnifiedDiaryEntry로 변환하는 함수
  const convertFirebaseToUnified = (firebaseEntry: DiaryEntry): UnifiedDiaryEntry => ({
    id: firebaseEntry.id,
    date: firebaseEntry.date,
    title: firebaseEntry.title,
    content: firebaseEntry.content,
    mood: firebaseEntry.mood,
    tags: firebaseEntry.tags,
    photos: firebaseEntry.photos,
    wordCount: firebaseEntry.wordCount,
    createdAt: firebaseEntry.createdAt,
    updatedAt: firebaseEntry.updatedAt,
    userId: firebaseEntry.userId
  });

  // 통일된 getDiaryByDate 함수
  const getDiaryByDate = async (date: string): Promise<UnifiedDiaryEntry | null> => {
    if (isUsingMockData) {
      const mockDiary = getMockDiaryByDate(date);
      return mockDiary ? convertMockToUnified(mockDiary) : null;
    } else {
      if (!user) return null;
      try {
        const firebaseDiary = await DiaryService.getDiaryByDate(user.uid, date);
        return firebaseDiary ? convertFirebaseToUnified(firebaseDiary) : null;
      } catch (err: any) {
        console.error('일기 조회 실패:', err);
        return null;
      }
    }
  };

  // 통일된 getRecentDiaries 함수
  const getRecentDiaries = async (count: number = 5): Promise<UnifiedDiaryEntry[]> => {
    if (isUsingMockData) {
      const mockDiaries = getMockRecentDiaries(count);
      return mockDiaries.map(convertMockToUnified);
    } else {
      if (!user) return [];
      try {
        const firebaseDiaries = await DiaryService.getRecentDiaries(user.uid, count);
        return firebaseDiaries.map(convertFirebaseToUnified);
      } catch (err: any) {
        console.error('최근 일기 조회 실패:', err);
        return [];
      }
    }
  };

  // 통일된 getDiariesByDateRange 함수
  const getDiariesByDateRange = async (startDate: string, endDate: string): Promise<UnifiedDiaryEntry[]> => {
    if (isUsingMockData) {
      const mockDiaries = getMockDiariesByDateRange(startDate, endDate);
      return mockDiaries.map(convertMockToUnified);
    } else {
      if (!user) return [];
      try {
        const firebaseDiaries = await DiaryService.getDiariesByDateRange(user.uid, startDate, endDate);
        return firebaseDiaries.map(convertFirebaseToUnified);
      } catch (err: any) {
        console.error('날짜 범위 일기 조회 실패:', err);
        return [];
      }
    }
  };

  // 통일된 hasDataForDate 함수
  const hasDataForDate = async (date: Date): Promise<boolean> => {
    if (isUsingMockData) {
      return mockHasDataForDate(date);
    } else {
      if (!user) return false;
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      try {
        return await DiaryService.hasDataForDate(user.uid, dateString);
      } catch (err: any) {
        console.error('일기 존재 확인 실패:', err);
        return false;
      }
    }
  };

  // 통일된 getDiaryCountByMonth 함수
  const getDiaryCountByMonth = async (year: number, month: number): Promise<number> => {
    if (isUsingMockData) {
      return getMockDiaryCountByMonth(year, month);
    } else {
      if (!user) return 0;
      try {
        return await DiaryService.getDiaryCountByMonth(user.uid, year, month);
      } catch (err: any) {
        console.error('월별 일기 개수 조회 실패:', err);
        return 0;
      }
    }
  };

  // Timeline 최적화용 배치 처리 함수
  const getDatesWithData = async (startDate: string, endDate: string): Promise<string[]> => {
    if (isUsingMockData) {
      // Mock 데이터에서 해당 범위의 날짜들 추출
      const mockDiaries = getMockDiariesByDateRange(startDate, endDate);
      return mockDiaries.map(diary => diary.date);
    } else {
      if (!user) return [];
      try {
        return await DiaryService.getDatesWithData(user.uid, startDate, endDate);
      } catch (err: any) {
        console.error('날짜 데이터 조회 실패:', err);
        return [];
      }
    }
  };

  // getContextByDate (현재는 Mock 데이터만)
  const getContextByDate = (date: string) => {
    return getMockContextByDate(date);
  };

  // CRUD 함수들 (Firebase 전용)
  const createDiary = async (
    title: string, 
    content: string, 
    date: string, 
    mood: string = 'neutral',
    tags: string[] = []
  ): Promise<string> => {
    if (isUsingMockData) {
      throw new Error('데모 모드에서는 일기를 저장할 수 없습니다. 로그인해주세요.');
    }
    
    if (!user) throw new Error('로그인이 필요합니다.');
    
    setIsLoading(true);
    setError(null);
    
    try {
      const diaryId = await DiaryService.createDiary({
        userId: user.uid,
        date,
        title,
        content,
        mood: mood as any,
        tags,
        photos: [],
        wordCount: content.length
      });
      return diaryId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDiary = async (diaryId: string, updates: Partial<UnifiedDiaryEntry>): Promise<void> => {
    if (isUsingMockData) {
      throw new Error('데모 모드에서는 일기를 수정할 수 없습니다. 로그인해주세요.');
    }
    
    if (!user) throw new Error('로그인이 필요합니다.');
    
    setIsLoading(true);
    setError(null);
    
    try {
      await DiaryService.updateDiary(diaryId, updates);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiary = async (diaryId: string): Promise<void> => {
    if (isUsingMockData) {
      throw new Error('데모 모드에서는 일기를 삭제할 수 없습니다. 로그인해주세요.');
    }
    
    if (!user) throw new Error('로그인이 필요합니다.');
    
    setIsLoading(true);
    setError(null);
    
    try {
      await DiaryService.deleteDiary(diaryId, user.uid);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: DataProviderInterface = {
    isUsingMockData,
    isLoading,
    error,
    
    // 읽기 함수들
    getDiaryByDate,
    getRecentDiaries,
    getDiariesByDateRange,
    hasDataForDate,
    getDiaryCountByMonth,
    getDatesWithData,
    getContextByDate,
    
    // 쓰기 함수들
    createDiary,
    updateDiary,
    deleteDiary,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
