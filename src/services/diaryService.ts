// Firebase 기반 실제 일기 CRUD 서비스
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  endBefore,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// 일기 데이터 타입 정의
export interface DiaryEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD 형식
  title: string;
  content: string;
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  tags: string[];
  photos: string[]; // Firebase Storage URLs
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
  version: number; // 버전 관리용
}

// 일기 생성용 데이터 타입 (id, createdAt, updatedAt 제외)
export type CreateDiaryData = Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt' | 'version'>;

// 일기 수정용 데이터 타입 (부분 업데이트 가능)
export type UpdateDiaryData = Partial<Omit<DiaryEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'version'>>;

// 페이지네이션 결과 타입
export interface PaginatedDiaries {
  diaries: DiaryEntry[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextCursor?: QueryDocumentSnapshot;
  prevCursor?: QueryDocumentSnapshot;
}

/**
 * Firebase 기반 일기 CRUD 서비스
 * 사용자별 데이터 분리 및 효율적인 쿼리 제공
 */
export class DiaryService {
  private static readonly COLLECTION_NAME = 'diaries';
  private static readonly PAGE_SIZE = 10;

  /**
   * 사용자의 모든 일기 조회 (최신순, 페이지네이션)
   */
  static async getUserDiaries(
    userId: string, 
    pageSize: number = this.PAGE_SIZE,
    cursor?: QueryDocumentSnapshot
  ): Promise<PaginatedDiaries> {
    try {
      const diariesRef = collection(db, this.COLLECTION_NAME);
      
      let q = query(
        diariesRef,
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(pageSize + 1) // +1 to check if there's a next page
      );

      // 커서가 있으면 해당 지점부터 시작
      if (cursor) {
        q = query(q, startAfter(cursor));
      }

      const snapshot = await getDocs(q);
      const docs = snapshot.docs;
      
      // 다음 페이지 존재 여부 확인
      const hasNextPage = docs.length > pageSize;
      const diaryDocs = hasNextPage ? docs.slice(0, -1) : docs;
      
      const diaries: DiaryEntry[] = diaryDocs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as DiaryEntry));

      return {
        diaries,
        hasNextPage,
        hasPrevPage: !!cursor,
        nextCursor: hasNextPage ? diaryDocs[diaryDocs.length - 1] : undefined,
        prevCursor: cursor
      };

    } catch (error) {
      console.error('일기 목록 조회 실패:', error);
      throw new Error('일기를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 특정 날짜의 일기 조회
   */
  static async getDiaryByDate(userId: string, date: string): Promise<DiaryEntry | null> {
    try {
      const diariesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        diariesRef,
        where('userId', '==', userId),
        where('date', '==', date),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as DiaryEntry;

    } catch (error) {
      console.error('날짜별 일기 조회 실패:', error);
      throw new Error('일기를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 새 일기 생성
   */
  static async createDiary(diaryData: CreateDiaryData): Promise<string> {
    try {
      // 단어 수 자동 계산
      const wordCount = diaryData.content.length;
      
      const diariesRef = collection(db, this.COLLECTION_NAME);
      const docRef = await addDoc(diariesRef, {
        ...diaryData,
        wordCount,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        version: 1
      });

      console.log('일기 생성 성공:', docRef.id);
      return docRef.id;

    } catch (error) {
      console.error('일기 생성 실패:', error);
      throw new Error('일기 저장에 실패했습니다.');
    }
  }

  /**
   * 일기 수정
   */
  static async updateDiary(diaryId: string, updates: UpdateDiaryData): Promise<void> {
    try {
      const diaryRef = doc(db, this.COLLECTION_NAME, diaryId);
      
      // 기존 일기 확인
      const diaryDoc = await getDoc(diaryRef);
      if (!diaryDoc.exists()) {
        throw new Error('수정할 일기를 찾을 수 없습니다.');
      }

      // 단어 수 재계산 (내용이 변경된 경우)
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.now(),
        version: (diaryDoc.data().version || 1) + 1
      };

      if (updates.content) {
        updateData.wordCount = updates.content.length;
      }

      await updateDoc(diaryRef, updateData);
      console.log('일기 수정 성공:', diaryId);

    } catch (error) {
      console.error('일기 수정 실패:', error);
      throw new Error('일기 수정에 실패했습니다.');
    }
  }

  /**
   * 일기 삭제
   */
  static async deleteDiary(diaryId: string, userId: string): Promise<void> {
    try {
      const diaryRef = doc(db, this.COLLECTION_NAME, diaryId);
      
      // 권한 확인 (사용자 본인 일기만 삭제 가능)
      const diaryDoc = await getDoc(diaryRef);
      if (!diaryDoc.exists()) {
        throw new Error('삭제할 일기를 찾을 수 없습니다.');
      }
      
      if (diaryDoc.data()?.userId !== userId) {
        throw new Error('삭제 권한이 없습니다.');
      }

      await deleteDoc(diaryRef);
      console.log('일기 삭제 성공:', diaryId);

    } catch (error) {
      console.error('일기 삭제 실패:', error);
      throw new Error('일기 삭제에 실패했습니다.');
    }
  }

  /**
   * 최근 일기 조회 (홈페이지용)
   */
  static async getRecentDiaries(userId: string, count: number = 5): Promise<DiaryEntry[]> {
    try {
      const diariesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        diariesRef,
        where('userId', '==', userId),
        orderBy('date', 'desc'),
        limit(count)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as DiaryEntry));

    } catch (error) {
      console.error('최근 일기 조회 실패:', error);
      throw new Error('최근 일기를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 날짜 범위별 일기 조회
   */
  static async getDiariesByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<DiaryEntry[]> {
    try {
      const diariesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        diariesRef,
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as DiaryEntry));

    } catch (error) {
      console.error('날짜 범위 일기 조회 실패:', error);
      throw new Error('해당 기간의 일기를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 특정 날짜에 일기가 있는지 확인 (최적화된 버전)
   * 전체 문서 대신 존재 여부만 확인하여 성능 향상
   */
  static async hasDataForDate(userId: string, date: string): Promise<boolean> {
    try {
      const diariesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        diariesRef,
        where('userId', '==', userId),
        where('date', '==', date),
        limit(1)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('일기 존재 확인 실패:', error);
      return false;
    }
  }

  /**
   * 날짜 범위 내에서 일기가 있는 날짜들만 조회 (Timeline 최적화용)
   * Timeline2D의 대량 hasDataForDate 호출을 대체하는 배치 처리 함수
   */
  static async getDatesWithData(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<string[]> {
    try {
      const diariesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        diariesRef,
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().date);
    } catch (error) {
      console.error('날짜 목록 조회 실패:', error);
      return [];
    }
  }

  /**
   * 월별 일기 개수 조회
   */
  static async getDiaryCountByMonth(userId: string, year: number, month: number): Promise<number> {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      
      const diariesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        diariesRef,
        where('userId', '==', userId),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );

      const snapshot = await getDocs(q);
      return snapshot.size;

    } catch (error) {
      console.error('월별 일기 개수 조회 실패:', error);
      return 0;
    }
  }

  /**
   * 전체 일기 통계 조회
   */
  static async getDiaryStats(userId: string): Promise<{
    totalDiaries: number;
    totalWords: number;
    averageWordsPerDiary: number;
    firstDiaryDate?: string;
    lastDiaryDate?: string;
  }> {
    try {
      const diariesRef = collection(db, this.COLLECTION_NAME);
      const q = query(
        diariesRef,
        where('userId', '==', userId),
        orderBy('date', 'asc')
      );

      const snapshot = await getDocs(q);
      const diaries = snapshot.docs.map(doc => doc.data());
      
      const totalDiaries = diaries.length;
      const totalWords = diaries.reduce((sum, diary) => sum + (diary.wordCount || 0), 0);
      const averageWordsPerDiary = totalDiaries > 0 ? Math.round(totalWords / totalDiaries) : 0;
      
      return {
        totalDiaries,
        totalWords,
        averageWordsPerDiary,
        firstDiaryDate: diaries.length > 0 ? diaries[0].date : undefined,
        lastDiaryDate: diaries.length > 0 ? diaries[diaries.length - 1].date : undefined,
      };

    } catch (error) {
      console.error('일기 통계 조회 실패:', error);
      throw new Error('통계를 불러오는데 실패했습니다.');
    }
  }
}

// 편의를 위한 기본 export
export default DiaryService;
