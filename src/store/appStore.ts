// 앱 메인 상태 관리 스토어
import { create } from 'zustand';
import { DiaryEntry, Event, LifeRecord } from '../services/database';

interface AppState {
  // 현재 선택된 날짜
  selectedDate: Date;
  
  // 뷰 모드
  viewMode: 'timeline' | 'diary' | 'topic';
  
  // 타임라인 뷰 설정
  timelineView: {
    currentYear: number;
    currentMonth: number;
    zoomLevel: 'year' | 'month' | 'week';
  };
  
  // 로딩 상태
  isLoading: boolean;
  
  // 캐시된 데이터
  cachedDiaries: Map<string, DiaryEntry>;
  cachedEvents: Event[];
  cachedLifeRecords: LifeRecord[];
  
  // 액션
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'timeline' | 'diary' | 'topic') => void;
  setTimelineView: (view: Partial<AppState['timelineView']>) => void;
  setLoading: (loading: boolean) => void;
  
  // 데이터 캐시 관리
  cacheDiary: (date: string, diary: DiaryEntry) => void;
  getCachedDiary: (date: string) => DiaryEntry | undefined;
  setCachedEvents: (events: Event[]) => void;
  setCachedLifeRecords: (records: LifeRecord[]) => void;
  
  // 유틸리티
  getDateKey: (date: Date) => string;
  navigateToDate: (date: Date) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // 초기 상태
  selectedDate: new Date(),
  viewMode: 'timeline',
  timelineView: {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    zoomLevel: 'month',
  },
  isLoading: false,
  cachedDiaries: new Map(),
  cachedEvents: [],
  cachedLifeRecords: [],

  // 액션
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setTimelineView: (view) => 
    set((state) => ({
      timelineView: { ...state.timelineView, ...view }
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  // 데이터 캐시 관리
  cacheDiary: (date, diary) =>
    set((state) => {
      const newCache = new Map(state.cachedDiaries);
      newCache.set(date, diary);
      return { cachedDiaries: newCache };
    }),
  
  getCachedDiary: (date) => get().cachedDiaries.get(date),
  
  setCachedEvents: (events) => set({ cachedEvents: events }),
  
  setCachedLifeRecords: (records) => set({ cachedLifeRecords: records }),
  
  // 유틸리티
  getDateKey: (date) => date.toISOString().split('T')[0],
  
  navigateToDate: (date) => {
    set({
      selectedDate: date,
      timelineView: {
        currentYear: date.getFullYear(),
        currentMonth: date.getMonth(),
        zoomLevel: 'month',
      },
    });
  },
}));