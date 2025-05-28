// 공통 타입 정의
export interface DateRange {
  start: Date;
  end: Date;
}

// UI 관련 타입
export interface ViewConfig {
  mode: 'timeline' | 'diary' | 'topic';
  zoomLevel: 'year' | 'month' | 'week' | 'day';
}

// 검색 관련 타입
export interface SearchQuery {
  text?: string;
  dateRange?: DateRange;
  tags?: string[];
  mood?: string;
  hasPhotos?: boolean;
}

export interface SearchResult {
  id: string;
  type: 'diary' | 'event' | 'life_record';
  date: Date;
  title: string;
  excerpt: string;
  relevanceScore: number;
}

// 외부 데이터 타입
export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  icon: string;
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  category: 'politics' | 'economy' | 'sports' | 'culture' | 'technology';
}

// 앱 설정 타입
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'ko' | 'en';
  notifications: {
    dailyReminder: boolean;
    reminderTime: string; // HH:mm format
    weeklyReport: boolean;
  };
  privacy: {
    backupEnabled: boolean;
    analyticsEnabled: boolean;
  };
  display: {
    timelineOrientation: 'horizontal' | 'vertical';
    showWeather: boolean;
    showNews: boolean;
    defaultView: 'timeline' | 'diary';
  };
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// 파일 업로드 타입
export interface FileUpload {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

// 통계 타입
export interface DiaryStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  averageMood: number;
  monthlyCount: { [key: string]: number };
  topTags: { tag: string; count: number }[];
}