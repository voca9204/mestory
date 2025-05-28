# ME.STORY 쿼리 최적화 및 인덱싱 가이드

## 🎯 개요

이 문서는 ME.STORY의 Firestore 쿼리 성능 최적화 전략과 인덱싱 시스템에 대한 종합 가이드입니다.

## 📊 최적화된 인덱스 구조

### 인덱스 생성 원칙
1. **시간 기반 분할**: 연도별/월별 컬렉션에 맞춘 인덱스
2. **복합 쿼리 최적화**: 자주 사용되는 필드 조합
3. **정렬 최적화**: DESC 정렬을 고려한 인덱스 설계
4. **배열 검색 지원**: array-contains 인덱스 포함

### 핵심 인덱스 패턴

#### 일기 (diaries-{year})
```javascript
// 기본 사용자별 최신순 조회
{ userId: ASC, date: DESC }

// 기분별 검색
{ userId: ASC, date: ASC, mood: ASC }

// 태그 검색
{ userId: ASC, tags: ARRAY_CONTAINS, date: DESC }
```

#### 미디어 (media-{year})
```javascript
// 업로드 순 조회
{ userId: ASC, uploadedAt: DESC }

// 타입별 검색
{ userId: ASC, type: ASC, uploadedAt: DESC }

// 일기별 미디어
{ diaryId: ASC, uploadedAt: ASC }
```

#### 맥락 데이터 (contexts-{year}-{month})
```javascript
// 타입별 조회
{ type: ASC, date: ASC }

// 소스별 조회
{ type: ASC, source: ASC, date: ASC }
```

## 🚀 성능 최적화 전략

### 1. 커서 기반 페이지네이션

#### 장점
- **메모리 효율성**: 오프셋 방식 대비 일정한 메모리 사용
- **일관된 성능**: 페이지 위치와 무관한 균일한 응답 시간
- **실시간 데이터**: 새 데이터 추가시에도 안정적 페이지네이션

#### 구현 예시
```typescript
const result = await OptimizedDiaryService.getByDateRangeOptimized(
  userId,
  startDate,
  endDate,
  { 
    limitCount: 20,
    cursor: lastDocumentSnapshot  // 이전 쿼리의 마지막 문서
  }
);

// 다음 페이지 로드
const nextPage = await OptimizedDiaryService.getByDateRangeOptimized(
  userId,
  startDate,
  endDate,
  { 
    limitCount: 20,
    cursor: result.nextCursor
  }
);
```

### 2. 다중 연도 병렬 처리

#### 전략
- **Promise.all 활용**: 여러 연도 컬렉션 동시 조회
- **결과 병합**: 클라이언트 측에서 시간순 정렬
- **조기 중단**: 필요한 만큼 결과를 얻으면 추가 조회 중단

#### 구현 패턴
```typescript
// 2020-2025년 데이터 병렬 조회
const years = [2025, 2024, 2023, 2022, 2021, 2020];
const promises = years.map(year => 
  queryYearCollection(year, limitPerYear)
);

const results = await Promise.all(promises);
const mergedResults = results
  .flat()
  .sort((a, b) => b.date.seconds - a.date.seconds)
  .slice(0, totalLimit);
```

### 3. 클라이언트 측 필터링 최적화

#### 적용 시나리오
- **복합 태그 검색**: Firestore의 array-contains 제한 우회
- **텍스트 검색**: 풀텍스트 검색 기능 부재 보완
- **복잡한 조건**: 서버 측 인덱스로 처리하기 어려운 조건

#### 최적화 기법
```typescript
// 1. 서버에서 기본 필터링
const baseResults = await getDiariesWithPrimaryFilter(userId, dateRange);

// 2. 클라이언트에서 추가 필터링
const filteredResults = baseResults.filter(diary => {
  // 다중 태그 체크
  const hasAllTags = requiredTags.every(tag => diary.tags.includes(tag));
  
  // 텍스트 검색
  const matchesText = diary.content.toLowerCase().includes(searchTerm);
  
  return hasAllTags && matchesText;
});
```

## 📈 성능 모니터링

### QueryPerformanceMonitor 사용법

#### 기본 측정
```typescript
const { result, executionTime } = await QueryPerformanceMonitor.measureQueryTime(
  'getUserDiaries',
  () => OptimizedDiaryService.getByDateRangeOptimized(userId, start, end)
);

console.log(`Query executed in ${executionTime}ms`);
```

#### 성능 비교
```typescript
const comparisons = await QueryPerformanceMonitor.compareQueries([
  {
    name: 'Basic Query',
    fn: () => basicQuery()
  },
  {
    name: 'Optimized Query', 
    fn: () => optimizedQuery()
  }
]);

// 자동으로 성능순 정렬 및 개선률 표시
```

### 성능 목표 지표

| 쿼리 타입 | 목표 응답시간 | 허용 한계 |
|-----------|---------------|-----------|
| 기본 일기 조회 | < 200ms | < 500ms |
| 검색 쿼리 | < 300ms | < 800ms |
| 미디어 조회 | < 150ms | < 400ms |
| 통합 검색 | < 500ms | < 1200ms |
| 스트레스 테스트 | < 1000ms | < 2000ms |

## 🛠️ 인덱스 관리 자동화

### 스크립트 명령어

#### 인덱스 생성
```bash
# 동적 인덱스 생성 (연도별 자동 생성)
npm run db:indexes:generate

# Firebase에 배포
npm run db:indexes:deploy

# 전체 프로세스 (생성 + 배포)
npm run db:indexes:all
```

#### 상태 확인
```bash
# 현재 인덱스 상태 확인
npm run db:indexes:status

# 성능 테스트 실행
npm run test:performance

# 종합 최적화 (인덱스 + 테스트)
npm run optimize
```

### 자동화 스크립트 기능

#### 동적 인덱스 생성
- **연도 범위**: 현재 기준 ±5년 자동 계산
- **월별 컬렉션**: contexts 컬렉션의 12개월 인덱스
- **템플릿 기반**: 컬렉션별 인덱스 패턴 적용

#### 관리 기능
- **배포 자동화**: Firebase CLI 통합
- **상태 모니터링**: 인덱스 빌드 상태 확인
- **사용량 분석**: 성능 통계 및 최적화 제안

## 🔍 고급 검색 최적화

### UnifiedSearchService 활용

#### 통합 검색 구현
```typescript
const searchResults = await UnifiedSearchService.searchAll(
  userId,
  'vacation',  // 검색어
  {
    dateRange: { start: lastYear, end: now },
    tags: ['travel'],
    mediaType: 'image'
  },
  { limitCount: 10 }
);

// 결과: { diaries, media, events }
```

#### 검색 성능 최적화
1. **병렬 처리**: 일기/미디어/이벤트 동시 검색
2. **인덱스 활용**: 기본 필터는 인덱스 사용
3. **클라이언트 필터링**: 복잡한 조건은 클라이언트에서 처리
4. **결과 제한**: 타입별로 적절한 limit 설정

### 검색 쿼리 패턴

#### 1. 태그 기반 검색
```typescript
// 단일 태그 (인덱스 활용)
const results = await OptimizedDiaryService.getByTag(userId, 'work');

// 다중 태그 (클라이언트 필터링)
const results = await OptimizedDiaryService.searchDiariesAdvanced(
  userId,
  { tags: ['work', 'project'] }
);
```

#### 2. 시간 범위 검색
```typescript
// 최적화된 날짜 범위 검색
const results = await OptimizedDiaryService.getByDateRangeOptimized(
  userId,
  new Date('2024-01-01'),
  new Date('2024-12-31')
);
```

#### 3. 복합 조건 검색
```typescript
// 기분 + 태그 + 날짜 범위
const results = await OptimizedDiaryService.searchDiariesAdvanced(
  userId,
  {
    mood: 'good',
    tags: ['vacation'],
    dateRange: { start: summer, end: fall }
  }
);
```

## 🎛️ 개발 및 운영 가이드

### 개발 환경 설정

#### 1. Firebase 에뮬레이터 사용
```bash
# 에뮬레이터 시작
npm run firebase:emulators

# 개발 서버와 함께 사용
npm run dev
```

#### 2. 인덱스 테스트
```bash
# 로컬에서 인덱스 생성 테스트
npm run db:indexes:generate

# 실제 Firebase에 배포 (주의!)
npm run db:indexes:deploy
```

### 성능 테스트 워크플로우

#### 1. 정기 성능 테스트
```bash
# 전체 성능 테스트 스위트 실행
npm run test:performance
```

#### 2. 회귀 테스트
- **코드 변경 후**: 성능 테스트 필수 실행
- **인덱스 변경 후**: 쿼리 성능 재측정
- **데이터 증가 후**: 스트레스 테스트 실행

### 운영 환경 모니터링

#### 성능 지표 추적
1. **평균 응답 시간**: < 500ms 유지
2. **95% 백분위수**: < 1000ms 유지
3. **에러율**: < 1% 유지
4. **동시 접속**: 목표 처리량 확인

#### 알림 설정
- **응답 시간 초과**: > 1000ms 시 알림
- **에러율 상승**: > 5% 시 알림
- **인덱스 빌드 실패**: 즉시 알림

## 🔧 트러블슈팅

### 일반적인 성능 문제

#### 1. 느린 쿼리 해결
```
문제: 특정 쿼리가 예상보다 느림
원인: 적절한 인덱스 부재
해결: firestore.indexes.json 확인 및 추가
```

#### 2. 메모리 사용량 증가
```
문제: 클라이언트 메모리 사용량 급증
원인: 대량 데이터 한번에 로드
해결: 페이지네이션 크기 조정 (limit 감소)
```

#### 3. 인덱스 빌드 실패
```
문제: Firebase에서 인덱스 빌드 실패
원인: 잘못된 필드명 또는 타입
해결: 콘솔에서 오류 확인 후 수정
```

### 성능 최적화 체크리스트

#### 쿼리 작성 시
- [ ] 적절한 인덱스 존재 확인
- [ ] limit() 사용으로 결과 제한
- [ ] 필요한 필드만 조회 (select 사용 고려)
- [ ] 복합 조건은 인덱스 순서 고려

#### 인덱스 관리 시
- [ ] 미사용 인덱스 정기 정리
- [ ] 새 쿼리 패턴에 맞춘 인덱스 추가
- [ ] 인덱스 빌드 상태 모니터링
- [ ] 비용 최적화 정기 검토

## 📚 참고 자료

### Firestore 공식 문서
- [쿼리 인덱스 관리](https://firebase.google.com/docs/firestore/query-data/indexing)
- [복합 쿼리](https://firebase.google.com/docs/firestore/query-data/queries)
- [성능 모니터링](https://firebase.google.com/docs/perf-mon)

### ME.STORY 관련 문서
- [데이터 모델 설계](./firestore-data-model.md)
- [프로젝트 구조](../structure.md)
- [개발 가이드](../README.md)

---

*최종 업데이트: 2025-05-25 - Task #2.2 완료*