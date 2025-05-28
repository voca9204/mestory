// ME.STORY 쿼리 최적화 및 성능 개선 서비스
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
  getCountFromServer,
  AggregateQuerySnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Diary, 
  Media, 
  Context, 
  Event, 
  LifeRecord,
  CollectionHelper,
  DiaryService,
  MediaService,
  ContextService,
  EventService 
} from './database';

// ============================================================================
// 쿼리 결과 타입 정의
// ============================================================================

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: QueryDocumentSnapshot<DocumentData>;
  prevCursor?: QueryDocumentSnapshot<DocumentData>;
  hasMore: boolean;
  totalCount?: number;
}

export interface QueryOptions {
  limitCount?: number;
  cursor?: QueryDocumentSnapshot<DocumentData>;
  direction?: 'next' | 'prev';
}

export interface SearchFilters {
  mood?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  mediaType?: string;
  minImportance?: number;
}

// ============================================================================
// 최적화된 일기 쿼리 서비스
// ============================================================================

export class OptimizedDiaryService extends DiaryService {
  
  // 최적화된 기간별 일기 조회 (커서 페이지네이션)
  static async getByDateRangeOptimized(
    userId: string,
    startDate: Date,
    endDate: Date,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Diary>> {
    const { limitCount = 20, cursor, direction = 'next' } = options;
    const results: Diary[] = [];
    let newCursor: QueryDocumentSnapshot<DocumentData> | undefined;
    let hasMore = false;

    try {
      // 여러 연도에 걸쳐있는 경우 각 연도별로 쿼리
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      
      // 역순으로 조회 (최신 일기부터)
      const years = direction === 'next' 
        ? Array.from({length: endYear - startYear + 1}, (_, i) => endYear - i)
        : Array.from({length: endYear - startYear + 1}, (_, i) => startYear + i);

      for (const year of years) {
        if (results.length >= limitCount) {
          hasMore = true;
          break;
        }

        const collection_name = CollectionHelper.getDiaryCollection(year);
        
        let constraints: QueryConstraint[] = [
          where('userId', '==', userId),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          orderBy('date', direction === 'next' ? 'desc' : 'asc'),
          limit(limitCount - results.length)
        ];

        // 커서 적용 (해당 연도에서만)
        if (cursor && year === (direction === 'next' ? endYear : startYear)) {
          if (direction === 'next') {
            constraints.push(startAfter(cursor));
          } else {
            constraints.push(endBefore(cursor));
          }
        }

        const q = query(collection(db, collection_name), ...constraints);
        const querySnapshot = await getDocs(q);
        
        querySnapshot.docs.forEach(doc => {
          if (results.length < limitCount) {
            results.push(doc.data() as Diary);
            newCursor = doc;
          } else {
            hasMore = true;
          }
        });

        // 현재 연도에서 충분한 결과를 얻었다면 중단
        if (querySnapshot.docs.length === limitCount - results.length + 1) {
          hasMore = true;
          break;
        }
      }

      return {
        items: results,
        nextCursor: newCursor,
        hasMore,
      };
    } catch (error) {
      console.error('최적화된 일기 목록 조회 오류:', error);
      throw error;
    }
  }

  // 고급 검색 (복합 필터)
  static async searchDiariesAdvanced(
    userId: string,
    filters: SearchFilters,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Diary>> {
    const { limitCount = 20, cursor } = options;
    const results: Diary[] = [];
    let newCursor: QueryDocumentSnapshot<DocumentData> | undefined;

    try {
      const { dateRange, mood, tags } = filters;
      
      if (!dateRange) {
        throw new Error('날짜 범위는 필수입니다');
      }

      const startYear = dateRange.start.getFullYear();
      const endYear = dateRange.end.getFullYear();

      for (let year = endYear; year >= startYear; year--) {
        if (results.length >= limitCount) break;

        const collection_name = CollectionHelper.getDiaryCollection(year);
        
        let constraints: QueryConstraint[] = [
          where('userId', '==', userId),
          where('date', '>=', Timestamp.fromDate(dateRange.start)),
          where('date', '<=', Timestamp.fromDate(dateRange.end)),
        ];

        // 기분 필터
        if (mood) {
          constraints.push(where('mood', '==', mood));
        }

        // 태그 필터 (배열 포함 검색)
        if (tags && tags.length > 0) {
          // Firestore는 배열에서 하나의 array-contains만 지원
          constraints.push(where('tags', 'array-contains', tags[0]));
        }

        constraints.push(
          orderBy('date', 'desc'),
          limit(limitCount - results.length)
        );

        if (cursor && year === endYear) {
          constraints.push(startAfter(cursor));
        }

        const q = query(collection(db, collection_name), ...constraints);
        const querySnapshot = await getDocs(q);
        
        querySnapshot.docs.forEach(doc => {
          const diary = doc.data() as Diary;
          
          // 클라이언트 측에서 추가 태그 필터링 (여러 태그인 경우)
          if (tags && tags.length > 1) {
            const hasAllTags = tags.every(tag => diary.tags.includes(tag));
            if (!hasAllTags) return;
          }
          
          results.push(diary);
          newCursor = doc;
        });
      }

      return {
        items: results,
        nextCursor: newCursor,
        hasMore: results.length === limitCount,
      };
    } catch (error) {
      console.error('고급 일기 검색 오류:', error);
      throw error;
    }
  }

  // 일기 개수 조회 (집계 쿼리)
  static async getCountByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      let totalCount = 0;
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      for (let year = startYear; year <= endYear; year++) {
        const collection_name = CollectionHelper.getDiaryCollection(year);
        
        const q = query(
          collection(db, collection_name),
          where('userId', '==', userId),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate))
        );

        const countSnapshot: AggregateQuerySnapshot<{count: number}> = await getCountFromServer(q);
        totalCount += countSnapshot.data().count;
      }

      return totalCount;
    } catch (error) {
      console.error('일기 개수 조회 오류:', error);
      throw error;
    }
  }

  // 태그별 일기 조회 (최적화된 인덱스 활용)
  static async getByTag(
    userId: string,
    tag: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Diary>> {
    const { limitCount = 20, cursor } = options;
    const results: Diary[] = [];
    let newCursor: QueryDocumentSnapshot<DocumentData> | undefined;

    try {
      // 최근 3년간 조회
      const currentYear = new Date().getFullYear();
      
      for (let year = currentYear; year >= currentYear - 2; year--) {
        if (results.length >= limitCount) break;

        const collection_name = CollectionHelper.getDiaryCollection(year);
        
        let constraints: QueryConstraint[] = [
          where('userId', '==', userId),
          where('tags', 'array-contains', tag),
          orderBy('date', 'desc'),
          limit(limitCount - results.length)
        ];

        if (cursor && year === currentYear) {
          constraints.push(startAfter(cursor));
        }

        const q = query(collection(db, collection_name), ...constraints);
        const querySnapshot = await getDocs(q);
        
        querySnapshot.docs.forEach(doc => {
          results.push(doc.data() as Diary);
          newCursor = doc;
        });
      }

      return {
        items: results,
        nextCursor: newCursor,
        hasMore: results.length === limitCount,
      };
    } catch (error) {
      console.error('태그별 일기 조회 오류:', error);
      throw error;
    }
  }
}

// ============================================================================
// 최적화된 미디어 쿼리 서비스
// ============================================================================

export class OptimizedMediaService extends MediaService {
  
  // 타입별 미디어 조회 (최적화된 인덱스 활용)
  static async getByTypeOptimized(
    userId: string,
    mediaType: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Media>> {
    const { limitCount = 20, cursor } = options;
    const results: Media[] = [];
    let newCursor: QueryDocumentSnapshot<DocumentData> | undefined;

    try {
      const currentYear = new Date().getFullYear();
      
      for (let year = currentYear; year >= currentYear - 2; year--) {
        if (results.length >= limitCount) break;

        const collection_name = CollectionHelper.getMediaCollection(year);
        
        let constraints: QueryConstraint[] = [
          where('userId', '==', userId),
          where('type', '==', mediaType),
          orderBy('uploadedAt', 'desc'),
          limit(limitCount - results.length)
        ];

        if (cursor && year === currentYear) {
          constraints.push(startAfter(cursor));
        }

        const q = query(collection(db, collection_name), ...constraints);
        const querySnapshot = await getDocs(q);
        
        querySnapshot.docs.forEach(doc => {
          results.push(doc.data() as Media);
          newCursor = doc;
        });
      }

      return {
        items: results,
        nextCursor: newCursor,
        hasMore: results.length === limitCount,
      };
    } catch (error) {
      console.error('타입별 미디어 조회 오류:', error);
      throw error;
    }
  }

  // 특정 일기의 미디어 조회 (최적화된 인덱스 활용)
  static async getByDiaryOptimized(diaryId: string): Promise<Media[]> {
    try {
      const dateStr = diaryId.split('_')[1];
      const year = parseInt(dateStr.substring(0, 4));
      const collection_name = CollectionHelper.getMediaCollection(year);
      
      // 최적화된 인덱스 활용
      const q = query(
        collection(db, collection_name),
        where('diaryId', '==', diaryId),
        orderBy('uploadedAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Media);
    } catch (error) {
      console.error('일기 미디어 조회 오류:', error);
      throw error;
    }
  }
}

// ============================================================================
// 최적화된 이벤트 쿼리 서비스
// ============================================================================

export class OptimizedEventService extends EventService {
  
  // 중요도별 이벤트 조회
  static async getByImportanceOptimized(
    userId: string,
    minImportance: number,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Event>> {
    const { limitCount = 20, cursor } = options;

    try {
      let constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        where('importance', '>=', minImportance),
        orderBy('importance', 'desc'),
        orderBy('date', 'asc'),
        limit(limitCount)
      ];

      if (cursor) {
        constraints.push(startAfter(cursor));
      }

      const q = query(collection(db, 'events'), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => doc.data() as Event);
      const newCursor = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        items,
        nextCursor: newCursor,
        hasMore: items.length === limitCount,
      };
    } catch (error) {
      console.error('중요도별 이벤트 조회 오류:', error);
      throw error;
    }
  }

  // 타입별 이벤트 조회
  static async getByTypeOptimized(
    userId: string,
    eventType: string,
    options: QueryOptions = {}
  ): Promise<PaginatedResult<Event>> {
    const { limitCount = 20, cursor } = options;

    try {
      let constraints: QueryConstraint[] = [
        where('userId', '==', userId),
        where('type', '==', eventType),
        orderBy('date', 'asc'),
        limit(limitCount)
      ];

      if (cursor) {
        constraints.push(startAfter(cursor));
      }

      const q = query(collection(db, 'events'), ...constraints);
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => doc.data() as Event);
      const newCursor = querySnapshot.docs[querySnapshot.docs.length - 1];

      return {
        items,
        nextCursor: newCursor,
        hasMore: items.length === limitCount,
      };
    } catch (error) {
      console.error('타입별 이벤트 조회 오류:', error);
      throw error;
    }
  }
}

// ============================================================================
// 최적화된 통합 검색 서비스
// ============================================================================

export class UnifiedSearchService {
  
  // 전체 검색 (일기 + 미디어 + 이벤트)
  static async searchAll(
    userId: string,
    searchTerm: string,
    filters: SearchFilters = {},
    options: QueryOptions = {}
  ): Promise<{
    diaries: PaginatedResult<Diary>;
    media: PaginatedResult<Media>;
    events: PaginatedResult<Event>;
  }> {
    try {
      const { limitCount = 10 } = options;

      // 병렬로 각 타입별 검색 실행
      const [diaries, media, events] = await Promise.all([
        this.searchDiaries(userId, searchTerm, filters, { limitCount }),
        this.searchMedia(userId, searchTerm, filters, { limitCount }),
        this.searchEvents(userId, searchTerm, filters, { limitCount }),
      ]);

      return { diaries, media, events };
    } catch (error) {
      console.error('통합 검색 오류:', error);
      throw error;
    }
  }

  // 일기 검색 (제목 + 내용)
  private static async searchDiaries(
    userId: string,
    searchTerm: string,
    filters: SearchFilters,
    options: QueryOptions
  ): Promise<PaginatedResult<Diary>> {
    // 클라이언트 측 텍스트 검색 (Firestore는 풀텍스트 검색 미지원)
    const dateRange = filters.dateRange || {
      start: new Date(new Date().getFullYear() - 1, 0, 1),
      end: new Date()
    };

    const result = await OptimizedDiaryService.getByDateRangeOptimized(
      userId, 
      dateRange.start, 
      dateRange.end, 
      { limitCount: options.limitCount! * 3 } // 여유분 확보
    );

    // 클라이언트 측에서 검색어 필터링
    const filteredItems = result.items.filter(diary => 
      diary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diary.content.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, options.limitCount);

    return {
      items: filteredItems,
      hasMore: filteredItems.length === options.limitCount,
    };
  }

  // 미디어 검색 (파일명)
  private static async searchMedia(
    userId: string,
    searchTerm: string,
    filters: SearchFilters,
    options: QueryOptions
  ): Promise<PaginatedResult<Media>> {
    const mediaType = filters.mediaType || 'image';
    
    const result = await OptimizedMediaService.getByTypeOptimized(
      userId, 
      mediaType, 
      { limitCount: options.limitCount! * 2 }
    );

    // 클라이언트 측에서 파일명 필터링
    const filteredItems = result.items.filter(media => 
      media.filename.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, options.limitCount);

    return {
      items: filteredItems,
      hasMore: filteredItems.length === options.limitCount,
    };
  }

  // 이벤트 검색 (제목 + 설명)
  private static async searchEvents(
    userId: string,
    searchTerm: string,
    filters: SearchFilters,
    options: QueryOptions
  ): Promise<PaginatedResult<Event>> {
    const result = await OptimizedEventService.getByImportanceOptimized(
      userId, 
      filters.minImportance || 1, 
      { limitCount: options.limitCount! * 2 }
    );

    // 클라이언트 측에서 제목/설명 필터링
    const filteredItems = result.items.filter(event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, options.limitCount);

    return {
      items: filteredItems,
      hasMore: filteredItems.length === options.limitCount,
    };
  }
}

// ============================================================================
// 성능 모니터링 유틸리티
// ============================================================================

export class QueryPerformanceMonitor {
  
  // 쿼리 실행 시간 측정
  static async measureQueryTime<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<{ result: T; executionTime: number }> {
    const startTime = performance.now();
    
    try {
      const result = await queryFn();
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.log(`[Performance] ${queryName}: ${executionTime.toFixed(2)}ms`);
      
      return { result, executionTime };
    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      console.error(`[Performance] ${queryName} failed after ${executionTime.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  // 여러 쿼리 성능 비교
  static async compareQueries<T>(
    queries: { name: string; fn: () => Promise<T> }[]
  ): Promise<{ name: string; result: T; executionTime: number }[]> {
    const results = [];
    
    for (const query of queries) {
      const { result, executionTime } = await this.measureQueryTime(query.name, query.fn);
      results.push({ name: query.name, result, executionTime });
    }
    
    // 성능 순으로 정렬
    results.sort((a, b) => a.executionTime - b.executionTime);
    
    console.log('[Performance Comparison]');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.name}: ${result.executionTime.toFixed(2)}ms`);
    });
    
    return results;
  }
}

// 기본 내보내기
export default {
  OptimizedDiaryService,
  OptimizedMediaService,
  OptimizedEventService,
  UnifiedSearchService,
  QueryPerformanceMonitor,
};
