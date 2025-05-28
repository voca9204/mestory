# ME.STORY Firestore 데이터 모델 설계 v2.0

## 🎯 설계 목표
- **100년 데이터 보존**: 시간 기반 분할로 장기 보관 최적화
- **대용량 처리**: 샤딩/해싱으로 성능 확보
- **문서 크기 제한**: 각 문서 1MiB 이하 유지
- **확장성**: 수백만 개 문서 대응 가능한 구조

## 📊 컬렉션 구조 overview

```
/users/{userId}
/diaries-{year}/{diaryId}
/media-{year}/{mediaId}
/contexts-{year}-{month}/{contextId}
/events/{eventId}
/life-records-{year}/{recordId}
/topics/{topicId}
/relationships/{relationshipId}
```

## 🗂️ 상세 컬렉션 설계

### 1. 사용자 (users)
**경로**: `/users/{userId}`
**명명 규칙**: Firebase Auth UID 사용
**문서 크기**: < 10KB (매우 작음)

```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: {
    theme: 'light' | 'dark';
    notifications: boolean;
    dataRetention: number;        // 년 단위 (기본: 100)
    privacy: {
      shareAnalytics: boolean;
      allowDataExport: boolean;
    };
  };
  statistics: {
    totalDiaries: number;
    totalPhotos: number;
    firstEntry: Timestamp;
    lastActivity: Timestamp;
  };
}
```

### 2. 일기 (diaries-{year})
**경로**: `/diaries-{year}/{diaryId}`
**분할 전략**: 연도별 컬렉션 분할
**명명 규칙**: `{userId}_{yyyymmdd}_{randomId}`
**문서 크기**: < 500KB (대형 콘텐츠는 서브컬렉션)

```typescript
interface Diary {
  id: string;                     // {userId}_{yyyymmdd}_{randomId}
  userId: string;
  date: Timestamp;                // 일기 작성 날짜
  title: string;
  content: string;                // 메인 콘텐츠 (최대 100KB)
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  weather?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags: string[];                 // 최대 20개
  isPrivate: boolean;
  
  // 메타데이터
  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;                // 버전 관리
  
  // 연결된 리소스 (참조만)
  mediaCount: number;             // 첨부 미디어 개수
  hasExtendedContent: boolean;    // 확장 콘텐츠 존재 여부
  relatedEntries: string[];       // 관련 일기 ID (최대 10개)
}
```

#### 서브컬렉션: 확장 콘텐츠
**경로**: `/diaries-{year}/{diaryId}/extended/{partId}`
**용도**: 매우 긴 일기 내용 분할 저장

### 3. 미디어 (media-{year})
**경로**: `/media-{year}/{mediaId}`
**분할 전략**: 연도별 + 사용자별 샤딩
**명명 규칙**: `{userId}_{timestamp}_{hash}`

```typescript
interface Media {
  id: string;                     // {userId}_{timestamp}_{hash}
  userId: string;
  type: 'image' | 'video' | 'audio' | 'document';
  
  // Firebase Storage 정보
  storagePath: string;            // Storage 경로
  downloadURL: string;            // 다운로드 URL
  thumbnailURL?: string;          // 썸네일 URL
  
  // 메타데이터
  filename: string;
  fileSize: number;               // bytes
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  
  // EXIF 데이터 (이미지용)
  exifData?: {
    dateTaken?: Timestamp;
    camera?: string;
    gps?: {
      latitude: number;
      longitude: number;
    };
  };
  
  // 연결 정보
  diaryId?: string;               // 연결된 일기
  uploadedAt: Timestamp;
  processedAt?: Timestamp;        // 처리 완료 시간
  
  // AI 분석 결과 (선택적)
  aiAnalysis?: {
    objects: string[];            // 감지된 객체
    faces: number;                // 얼굴 수
    text?: string;                // OCR 결과
  };
}
```

### 4. 맥락 데이터 (contexts-{year}-{month})
**경로**: `/contexts-{year}-{month}/{contextId}`
**분할 전략**: 연도-월별 분할 (데이터량이 많아서 월별로 분할)
**명명 규칙**: `{type}_{date}_{source}`

```typescript
interface Context {
  id: string;                     // {type}_{date}_{source}
  date: Timestamp;                // 해당 날짜
  type: 'weather' | 'news' | 'sports' | 'culture' | 'economy';
  source: string;                 // 데이터 소스
  
  // 타입별 데이터
  data: WeatherData | NewsData | SportsData | CultureData | EconomyData;
  
  // 메타데이터
  fetchedAt: Timestamp;
  expiresAt?: Timestamp;          // 데이터 만료 시간
  reliability: number;            // 신뢰도 점수 (0-1)
}

interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  precipitation: number;
  windSpeed: number;
  location: string;
}

interface NewsData {
  headlines: Array<{
    title: string;
    category: string;
    importance: number;           // 0-1
  }>;
  majorEvents: string[];
}
```

### 5. 이벤트 (events)
**경로**: `/events/{eventId}`
**분할 전략**: 전체 단일 컬렉션 (상대적으로 적은 데이터)
**명명 규칙**: `{userId}_{type}_{date}_{randomId}`

```typescript
interface Event {
  id: string;                     // {userId}_{type}_{date}_{randomId}
  userId: string;
  title: string;
  date: Timestamp;
  type: 'birthday' | 'anniversary' | 'memorial' | 'milestone' | 'custom';
  
  // 반복 설정
  recurring?: {
    type: 'yearly' | 'monthly' | 'weekly' | 'none';
    interval: number;             // 간격
    endDate?: Timestamp;          // 반복 종료일
  };
  
  description?: string;
  importance: number;             // 1-5
  tags: string[];
  
  // 알림 설정
  notifications?: Array<{
    type: 'email' | 'push';
    daysBeforeо: number;
  }>;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 6. 생활 기록 (life-records-{year})
**경로**: `/life-records-{year}/{recordId}`
**분할 전략**: 연도별 분할
**명명 규칙**: `{userId}_{type}_{date}_{randomId}`

```typescript
interface LifeRecord {
  id: string;                     // {userId}_{type}_{date}_{randomId}
  userId: string;
  date: Timestamp;
  type: 'expense' | 'gift_money' | 'exercise' | 'health' | 'work' | 'travel';
  category: string;
  
  // 공통 필드
  title: string;
  description?: string;
  amount?: number;                // 금액 (해당시)
  currency?: string;              // 통화
  
  // 타입별 세부 데이터
  metadata: ExpenseData | GiftMoneyData | ExerciseData | HealthData | WorkData | TravelData;
  
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 7. 토픽 (topics)
**경로**: `/topics/{topicId}`
**분할 전략**: 전체 단일 컬렉션
**명명 규칙**: `{userId}_{topicName}_{randomId}`

```typescript
interface Topic {
  id: string;                     // {userId}_{topicName}_{randomId}
  userId: string;
  name: string;                   // 토픽 이름
  description?: string;
  color: string;                  // 테마 색상
  
  // 자동 분류 설정
  autoClassification?: {
    enabled: boolean;
    keywords: string[];           // 키워드 매칭
    aiEnabled: boolean;           // AI 분류 사용
  };
  
  // 통계
  statistics: {
    totalEntries: number;
    firstEntry: Timestamp;
    lastEntry: Timestamp;
    averageEntriesPerMonth: number;
  };
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 8. 관계 (relationships)
**경로**: `/relationships/{relationshipId}`
**분할 전략**: 전체 단일 컬렉션
**명명 규칙**: `{sourceType}_{sourceId}_{targetType}_{targetId}`

```typescript
interface Relationship {
  id: string;                     // {sourceType}_{sourceId}_{targetType}_{targetId}
  userId: string;
  
  // 소스 엔티티
  source: {
    type: 'diary' | 'media' | 'event' | 'topic';
    id: string;
    collection: string;           // 정확한 컬렉션 경로
  };
  
  // 타겟 엔티티
  target: {
    type: 'diary' | 'media' | 'event' | 'topic';
    id: string;
    collection: string;
  };
  
  // 관계 정보
  relationshipType: 'related' | 'inspired_by' | 'sequel_to' | 'contains' | 'tagged_with';
  strength: number;               // 관계 강도 (0-1)
  bidirectional: boolean;         // 양방향 관계 여부
  
  // 자동 생성 정보
  autoGenerated: boolean;         // AI가 자동으로 생성한 관계
  confidence: number;             // 관계 신뢰도 (0-1)
  
  createdAt: Timestamp;
  note?: string;                  // 관계에 대한 설명
}
```

## 🔧 최적화 전략

### 1. 문서 크기 최적화
- **일기 본문**: 100KB 제한, 초과시 서브컬렉션 분할
- **미디어 메타데이터**: 실제 파일은 Storage, 메타정보만 Firestore
- **컨텍스트 데이터**: 타입별 구조화로 불필요한 필드 제거

### 2. 샤딩 전략
- **연도별 분할**: 일기, 미디어, 생활기록
- **월별 분할**: 맥락 데이터 (데이터량 많음)
- **사용자별 프리픽스**: 모든 문서 ID에 userId 포함

### 3. 인덱싱 최적화
```javascript
// 복합 인덱스 예시
// diaries-2025: userId, date(desc)
// media-2025: userId, uploadedAt(desc), type
// contexts-2025-05: type, date, source
```

### 4. 쿼리 최적화
- **페이지네이션**: startAfter/endBefore 커서 사용
- **필드 제한**: select()로 필요한 필드만 조회
- **배치 쿼리**: 여러 연도 데이터는 Promise.all로 병렬 처리

## 📈 확장성 고려사항

### 데이터 성장 예측
- **일기**: 연간 500개 × 100년 = 50,000개
- **사진**: 연간 2,000장 × 100년 = 200,000장
- **맥락 데이터**: 일간 10개 × 365일 × 100년 = 365,000개

### 비용 최적화
- **핫 데이터**: 최근 5년 (자주 접근)
- **웜 데이터**: 6-20년 전 (가끔 접근)
- **콜드 데이터**: 20년+ (아카이브용)

### 마이그레이션 전략
- **점진적 이전**: 기존 컬렉션에서 새 구조로 배치 이전
- **버전 관리**: 각 문서에 version 필드로 스키마 진화 대응
- **백워드 호환성**: 구 버전 클라이언트 지원
