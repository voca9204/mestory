// ME.STORY 최적화된 Firestore 데이터베이스 서비스 v2.0
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  Timestamp,
  writeBatch,
  DocumentReference,
  QueryDocumentSnapshot,
  FieldValue,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================================================
// 타입 정의
// ============================================================================

// 기본 사용자 인터페이스
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    dataRetention: number;
    privacy: {
      shareAnalytics: boolean;
      allowDataExport: boolean;
    };
  };
  statistics: {
    totalDiaries: number;
    totalPhotos: number;
    firstEntry: Timestamp | null;
    lastActivity: Timestamp;
  };
}

// 최적화된 일기 인터페이스
export interface Diary {
  id: string;                     // {userId}_{yyyymmdd}_{randomId}
  userId: string;
  date: Timestamp;
  title: string;
  content: string;                // 최대 100KB
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  weather?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags: string[];
  isPrivate: boolean;
  
  // 메타데이터
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
  
  // 연결된 리소스 (참조만)
  mediaCount: number;
  hasExtendedContent: boolean;
  relatedEntries: string[];
}

// 확장 콘텐츠 (매우 긴 일기용)
export interface ExtendedContent {
  id: string;
  diaryId: string;
  partNumber: number;
  content: string;
  createdAt: Timestamp;
}

// 미디어 인터페이스
export interface Media {
  id: string;                     // {userId}_{timestamp}_{hash}
  userId: string;
  type: 'image' | 'video' | 'audio' | 'document';
  
  // Firebase Storage 정보
  storagePath: string;
  downloadURL: string;
  thumbnailURL?: string;
  
  // 메타데이터
  filename: string;
  fileSize: number;
  mimeType: string;
  dimensions?: { width: number; height: number; };
  
  // EXIF 데이터
  exifData?: {
    dateTaken?: Timestamp;
    camera?: string;
    gps?: { latitude: number; longitude: number; };
  };
  
  // 연결 정보
  diaryId?: string;
  uploadedAt: Timestamp;
  processedAt?: Timestamp;
  
  // AI 분석 결과
  aiAnalysis?: {
    objects: string[];
    faces: number;
    text?: string;
  };
}

// 맥락 데이터 인터페이스
export interface Context {
  id: string;                     // {type}_{date}_{source}
  date: Timestamp;
  type: 'weather' | 'news' | 'sports' | 'culture' | 'economy';
  source: string;
  data: WeatherData | NewsData | SportsData | CultureData | EconomyData;
  fetchedAt: Timestamp;
  expiresAt?: Timestamp;
  reliability: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
  location: string;
}

export interface NewsData {
  headlines: Array<{
    title: string;
    category: string;
    importance: number;
  }>;
  majorEvents: string[];
}

export interface SportsData {
  events: Array<{
    sport: string;
    teams: string[];
    result?: string;
    importance: number;
  }>;
}

export interface CultureData {
  events: Array<{
    type: 'movie' | 'music' | 'book' | 'exhibition';
    title: string;
    description: string;
    popularity: number;
  }>;
}

export interface EconomyData {
  indices: Array<{
    name: string;
    value: number;
    change: number;
  }>;
  major_news: string[];
}

// 이벤트 인터페이스
export interface Event {
  id: string;                     // {userId}_{type}_{date}_{randomId}
  userId: string;
  title: string;
  date: Timestamp;
  type: 'birthday' | 'anniversary' | 'memorial' | 'milestone' | 'custom';
  recurring?: {
    type: 'yearly' | 'monthly' | 'weekly' | 'none';
    interval: number;
    endDate?: Timestamp;
  };
  description?: string;
  importance: number;
  tags: string[];
  notifications?: Array<{
    type: 'email' | 'push';
    daysBefore: number;
  }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 생활 기록 인터페이스
export interface LifeRecord {
  id: string;                     // {userId}_{type}_{date}_{randomId}
  userId: string;
  date: Timestamp;
  type: 'expense' | 'gift_money' | 'exercise' | 'health' | 'work' | 'travel';
  category: string;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  metadata: Record<string, any>;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 토픽 인터페이스
export interface Topic {
  id: string;                     // {userId}_{topicName}_{randomId}
  userId: string;
  name: string;
  description?: string;
  color: string;
  autoClassification?: {
    enabled: boolean;
    keywords: string[];
    aiEnabled: boolean;
  };
  statistics: {
    totalEntries: number;
    firstEntry: Timestamp | null;
    lastEntry: Timestamp | null;
    averageEntriesPerMonth: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 관계 인터페이스
export interface Relationship {
  id: string;                     // {sourceType}_{sourceId}_{targetType}_{targetId}
  userId: string;
  source: {
    type: 'diary' | 'media' | 'event' | 'topic';
    id: string;
    collection: string;
  };
  target: {
    type: 'diary' | 'media' | 'event' | 'topic';
    id: string;
    collection: string;
  };
  relationshipType: 'related' | 'inspired_by' | 'sequel_to' | 'contains' | 'tagged_with';
  strength: number;
  bidirectional: boolean;
  autoGenerated: boolean;
  confidence: number;
  createdAt: Timestamp;
  note?: string;
}

// ============================================================================
// 유틸리티 함수
// ============================================================================

// 컬렉션 이름 생성 헬퍼
export class CollectionHelper {
  static getDiaryCollection(year: number): string {
    return `diaries-${year}`;
  }
  
  static getMediaCollection(year: number): string {
    return `media-${year}`;
  }
  
  static getContextCollection(year: number, month: number): string {
    const monthStr = month.toString().padStart(2, '0');
    return `contexts-${year}-${monthStr}`;
  }
  
  static getLifeRecordCollection(year: number): string {
    return `life-records-${year}`;
  }
  
  static getUsersCollection(): string {
    return 'users';
  }
  
  static getEventsCollection(): string {
    return 'events';
  }
  
  static getTopicsCollection(): string {
    return 'topics';
  }
  
  static getRelationshipsCollection(): string {
    return 'relationships';
  }
}

// ID 생성 헬퍼
export class IdHelper {
  static generateDiaryId(userId: string, date: Date): string {
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const randomId = Math.random().toString(36).substr(2, 9);
    return `${userId}_${dateStr}_${randomId}`;
  }
  
  static generateMediaId(userId: string): string {
    const timestamp = Date.now().toString();
    const randomId = Math.random().toString(36).substr(2, 9);
    return `${userId}_${timestamp}_${randomId}`;
  }
  
  static generateContextId(type: string, date: Date, source: string): string {
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    return `${type}_${dateStr}_${source}`;
  }
  
  static generateEventId(userId: string, type: string, date: Date): string {
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const randomId = Math.random().toString(36).substr(2, 9);
    return `${userId}_${type}_${dateStr}_${randomId}`;
  }
  
  static generateLifeRecordId(userId: string, type: string, date: Date): string {
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const randomId = Math.random().toString(36).substr(2, 9);
    return `${userId}_${type}_${dateStr}_${randomId}`;
  }
  
  static generateTopicId(userId: string, topicName: string): string {
    const safeName = topicName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomId = Math.random().toString(36).substr(2, 9);
    return `${userId}_${safeName}_${randomId}`;
  }
  
  static generateRelationshipId(
    sourceType: string, sourceId: string, 
    targetType: string, targetId: string
  ): string {
    return `${sourceType}_${sourceId}_${targetType}_${targetId}`;
  }
}

// ============================================================================
// 서비스 클래스들
// ============================================================================

// 사용자 서비스
export class UserService {
  private static COLLECTION = CollectionHelper.getUsersCollection();

  static async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, userData.uid);
      await updateDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('사용자 생성 오류:', error);
      throw error;
    }
  }

  static async getUser(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, this.COLLECTION, uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('사용자 조회 오류:', error);
      throw error;
    }
  }

  static async updateUserStatistics(
    uid: string, 
    updates: Partial<User['statistics']>
  ): Promise<void> {
    try {
      const userRef = doc(db, this.COLLECTION, uid);
      await updateDoc(userRef, {
        [`statistics.${Object.keys(updates)[0]}`]: Object.values(updates)[0],
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('사용자 통계 업데이트 오류:', error);
      throw error;
    }
  }
}

// 최적화된 일기 서비스
export class DiaryService {
  // 일기 작성
  static async createEntry(entry: Omit<Diary, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Promise<string> {
    try {
      const year = entry.date.toDate().getFullYear();
      const collection_name = CollectionHelper.getDiaryCollection(year);
      const id = IdHelper.generateDiaryId(entry.userId, entry.date.toDate());
      
      const diaryData: Diary = {
        ...entry,
        id,
        version: 1,
        mediaCount: 0,
        hasExtendedContent: false,
        relatedEntries: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      // 콘텐츠가 100KB를 초과하는 경우 분할
      if (entry.content.length > 100000) {
        const mainContent = entry.content.substring(0, 100000);
        const extendedContent = entry.content.substring(100000);
        
        diaryData.content = mainContent;
        diaryData.hasExtendedContent = true;
        
        // 메인 일기 저장
        await updateDoc(doc(db, collection_name, id), diaryData);
        
        // 확장 콘텐츠 저장
        await this.saveExtendedContent(collection_name, id, extendedContent);
      } else {
        await updateDoc(doc(db, collection_name, id), diaryData);
      }
      
      // 사용자 통계 업데이트
      await UserService.updateUserStatistics(entry.userId, {
        totalDiaries: increment(1),
        lastActivity: Timestamp.now(),
      });
      
      return id;
    } catch (error) {
      console.error('일기 작성 오류:', error);
      throw error;
    }
  }

  // 확장 콘텐츠 저장
  private static async saveExtendedContent(
    collectionName: string, 
    diaryId: string, 
    content: string
  ): Promise<void> {
    const extendedRef = collection(db, collectionName, diaryId, 'extended');
    let partNumber = 1;
    
    // 100KB씩 분할
    for (let i = 0; i < content.length; i += 100000) {
      const part = content.substring(i, i + 100000);
      await addDoc(extendedRef, {
        diaryId,
        partNumber,
        content: part,
        createdAt: Timestamp.now(),
      });
      partNumber++;
    }
  }

  // 특정 날짜 일기 조회
  static async getByDate(userId: string, date: Date): Promise<Diary | null> {
    try {
      const year = date.getFullYear();
      const collection_name = CollectionHelper.getDiaryCollection(year);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const q = query(
        collection(db, collection_name),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const diary = doc.data() as Diary;
        
        // 확장 콘텐츠가 있다면 병합
        if (diary.hasExtendedContent) {
          const fullContent = await this.getFullContent(collection_name, diary.id);
          diary.content = fullContent;
        }
        
        return diary;
      }
      return null;
    } catch (error) {
      console.error('일기 조회 오류:', error);
      throw error;
    }
  }

  // 전체 콘텐츠 가져오기 (확장 콘텐츠 포함)
  private static async getFullContent(collectionName: string, diaryId: string): Promise<string> {
    try {
      const mainDoc = await getDoc(doc(db, collectionName, diaryId));
      if (!mainDoc.exists()) return '';
      
      let fullContent = mainDoc.data().content;
      
      // 확장 콘텐츠 조회
      const extendedQuery = query(
        collection(db, collectionName, diaryId, 'extended'),
        orderBy('partNumber', 'asc')
      );
      
      const extendedSnapshot = await getDocs(extendedQuery);
      extendedSnapshot.docs.forEach(doc => {
        fullContent += doc.data().content;
      });
      
      return fullContent;
    } catch (error) {
      console.error('전체 콘텐츠 조회 오류:', error);
      throw error;
    }
  }

  // 기간별 일기 목록 조회 (페이지네이션 지원)
  static async getByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
    limitCount: number = 20,
    lastDoc?: QueryDocumentSnapshot
  ): Promise<{ diaries: Diary[]; lastDoc?: QueryDocumentSnapshot }> {
    try {
      const results: Diary[] = [];
      let newLastDoc: QueryDocumentSnapshot | undefined;
      
      // 여러 연도에 걸쳐있는 경우 각 연도별로 쿼리
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();
      
      for (let year = endYear; year >= startYear; year--) {
        const collection_name = CollectionHelper.getDiaryCollection(year);
        
        let q = query(
          collection(db, collection_name),
          where('userId', '==', userId),
          where('date', '>=', Timestamp.fromDate(startDate)),
          where('date', '<=', Timestamp.fromDate(endDate)),
          orderBy('date', 'desc'),
          limit(limitCount - results.length)
        );
        
        if (lastDoc && year === endYear) {
          q = query(q, startAfter(lastDoc));
        }
        
        const querySnapshot = await getDocs(q);
        querySnapshot.docs.forEach(doc => {
          results.push(doc.data() as Diary);
          newLastDoc = doc;
        });
        
        if (results.length >= limitCount) break;
      }
      
      return { diaries: results, lastDoc: newLastDoc };
    } catch (error) {
      console.error('일기 목록 조회 오류:', error);
      throw error;
    }
  }

  // 일기 업데이트
  static async updateEntry(id: string, updates: Partial<Diary>): Promise<void> {
    try {
      // ID에서 연도 추출
      const dateStr = id.split('_')[1];
      const year = parseInt(dateStr.substring(0, 4));
      const collection_name = CollectionHelper.getDiaryCollection(year);
      
      const docRef = doc(db, collection_name, id);
      await updateDoc(docRef, {
        ...updates,
        ...(updates.date && { date: Timestamp.fromDate(updates.date.toDate()) }),
        updatedAt: Timestamp.now(),
        version: increment(1),
      });
    } catch (error) {
      console.error('일기 업데이트 오류:', error);
      throw error;
    }
  }

  // 일기 삭제
  static async deleteEntry(userId: string, id: string): Promise<void> {
    try {
      // ID에서 연도 추출
      const dateStr = id.split('_')[1];
      const year = parseInt(dateStr.substring(0, 4));
      const collection_name = CollectionHelper.getDiaryCollection(year);
      
      // 확장 콘텐츠도 함께 삭제
      const extendedQuery = query(collection(db, collection_name, id, 'extended'));
      const extendedSnapshot = await getDocs(extendedQuery);
      
      const batch = writeBatch(db);
      
      // 확장 콘텐츠 삭제
      extendedSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // 메인 일기 삭제
      batch.delete(doc(db, collection_name, id));
      
      await batch.commit();
      
      // 사용자 통계 업데이트
      await UserService.updateUserStatistics(userId, {
        totalDiaries: increment(-1),
      });
    } catch (error) {
      console.error('일기 삭제 오류:', error);
      throw error;
    }
  }
}

// 미디어 서비스
export class MediaService {
  // 미디어 메타데이터 저장
  static async createMedia(media: Omit<Media, 'id' | 'uploadedAt'>): Promise<string> {
    try {
      const year = new Date().getFullYear();
      const collection_name = CollectionHelper.getMediaCollection(year);
      const id = IdHelper.generateMediaId(media.userId);
      
      const mediaData: Media = {
        ...media,
        id,
        uploadedAt: Timestamp.now(),
      };
      
      await updateDoc(doc(db, collection_name, id), mediaData);
      
      // 일기와 연결되어 있다면 일기의 미디어 카운트 증가
      if (media.diaryId) {
        await this.incrementDiaryMediaCount(media.diaryId, 1);
      }
      
      // 사용자 통계 업데이트
      await UserService.updateUserStatistics(media.userId, {
        totalPhotos: increment(1),
      });
      
      return id;
    } catch (error) {
      console.error('미디어 생성 오류:', error);
      throw error;
    }
  }

  // 일기의 미디어 카운트 업데이트
  private static async incrementDiaryMediaCount(diaryId: string, increment_value: number): Promise<void> {
    try {
      const dateStr = diaryId.split('_')[1];
      const year = parseInt(dateStr.substring(0, 4));
      const collection_name = CollectionHelper.getDiaryCollection(year);
      
      await updateDoc(doc(db, collection_name, diaryId), {
        mediaCount: increment(increment_value),
      });
    } catch (error) {
      console.error('일기 미디어 카운트 업데이트 오류:', error);
      // 치명적이지 않은 오류이므로 throw하지 않음
    }
  }

  // 특정 일기의 미디어 조회
  static async getByDiary(diaryId: string): Promise<Media[]> {
    try {
      const dateStr = diaryId.split('_')[1];
      const year = parseInt(dateStr.substring(0, 4));
      const collection_name = CollectionHelper.getMediaCollection(year);
      
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

  // 사용자의 최근 미디어 조회
  static async getRecentMedia(
    userId: string, 
    limitCount: number = 20
  ): Promise<Media[]> {
    try {
      const currentYear = new Date().getFullYear();
      const results: Media[] = [];
      
      // 최근 3년간 조회
      for (let year = currentYear; year >= currentYear - 2 && results.length < limitCount; year--) {
        const collection_name = CollectionHelper.getMediaCollection(year);
        
        const q = query(
          collection(db, collection_name),
          where('userId', '==', userId),
          orderBy('uploadedAt', 'desc'),
          limit(limitCount - results.length)
        );
        
        const querySnapshot = await getDocs(q);
        querySnapshot.docs.forEach(doc => {
          results.push(doc.data() as Media);
        });
      }
      
      return results;
    } catch (error) {
      console.error('최근 미디어 조회 오류:', error);
      throw error;
    }
  }
}

// 맥락 데이터 서비스
export class ContextService {
  // 맥락 데이터 저장
  static async saveContextData(context: Omit<Context, 'id' | 'fetchedAt'>): Promise<string> {
    try {
      const date = context.date.toDate();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const collection_name = CollectionHelper.getContextCollection(year, month);
      const id = IdHelper.generateContextId(context.type, date, context.source);
      
      const contextData: Context = {
        ...context,
        id,
        fetchedAt: Timestamp.now(),
      };
      
      await updateDoc(doc(db, collection_name, id), contextData);
      return id;
    } catch (error) {
      console.error('맥락 데이터 저장 오류:', error);
      throw error;
    }
  }

  // 특정 날짜의 맥락 데이터 조회
  static async getByDate(date: Date, type?: string): Promise<Context[]> {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const collection_name = CollectionHelper.getContextCollection(year, month);
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      let q = query(
        collection(db, collection_name),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );

      if (type) {
        q = query(q, where('type', '==', type));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Context);
    } catch (error) {
      console.error('맥락 데이터 조회 오류:', error);
      throw error;
    }
  }
}

// 이벤트 서비스
export class EventService {
  private static COLLECTION = CollectionHelper.getEventsCollection();

  // 이벤트 생성
  static async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const id = IdHelper.generateEventId(event.userId, event.type, event.date.toDate());
      
      const eventData: Event = {
        ...event,
        id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      await updateDoc(doc(db, this.COLLECTION, id), eventData);
      return id;
    } catch (error) {
      console.error('이벤트 생성 오류:', error);
      throw error;
    }
  }

  // 사용자의 이벤트 목록 조회
  static async getUserEvents(userId: string): Promise<Event[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Event);
    } catch (error) {
      console.error('이벤트 조회 오류:', error);
      throw error;
    }
  }

  // 특정 기간의 이벤트 조회
  static async getEventsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Event[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as Event);
    } catch (error) {
      console.error('기간별 이벤트 조회 오류:', error);
      throw error;
    }
  }
}

// 기본 내보내기
export default {
  UserService,
  DiaryService,
  MediaService,
  ContextService,
  EventService,
  CollectionHelper,
  IdHelper,
};
