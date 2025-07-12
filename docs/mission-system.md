# ME.STORY 미션 시스템 개발 문서

## 📋 개요
ME.STORY의 미션 시스템은 사용자가 30일 동안 매일 작은 실천을 통해 습관을 형성할 수 있도록 돕는 기능입니다.

## 🏗️ 시스템 구조

### 파일 구조
```
src/
├── pages/
│   ├── MissionsPage.tsx         # 미션 선택 페이지
│   ├── NewMissionPage.tsx       # 새 미션 생성 페이지
│   └── ActiveMissionsPage.tsx   # 진행 중인 미션 관리 페이지
├── components/
│   └── Navigation.tsx           # 네비게이션 (미션 배지 포함)
├── store/
│   └── missionStore.ts          # Zustand 기반 미션 상태 관리
├── types/
│   ├── missions.ts              # 미션 타입 정의
│   └── missionContent.ts        # 미션 콘텐츠 (30일치 미션 내용)
└── App.tsx                      # 라우팅 설정
```

## 🎯 주요 기능

### 1. 미션 타입
- **🧘 마음챙김**: 명상, 감사 일기 등 정신 건강 관련
- **💪 운동**: 스트레칭, 플랭크 등 신체 건강 관련
- **📚 자기계발**: 독서, 새로운 것 배우기 등 성장 관련
- **🍎 건강한 습관**: 물 마시기, 일찍 자기 등 생활 습관
- **💝 감사**: 감사 표현, 친절한 행동 등 관계 개선
- **🎨 창의성**: 그림 그리기, 글쓰기 등 창의력 개발
- **🎯 종합 미션**: 여러 카테고리를 조합한 맞춤형 미션

### 2. 미션 생성 흐름
1. 미션 타입 선택
2. 시작일 설정 (기본: 오늘)
3. 기간 설정 (기본: 30일, 최소 7일 ~ 최대 365일)
4. 종합 미션의 경우 포함할 카테고리 선택
5. 미션 생성 및 시작

### 3. 미션 진행 관리
- 매일 다른 미션 내용 제공
- 완료/미완료 상태 토글
- 진행률 시각적 표시 (프로그레스 바)
- 남은 일수 및 완료한 일수 표시
- 미션 삭제 기능 (확인 후 삭제)

### 4. 데이터 저장
- 브라우저 localStorage 사용
- `missions` 키에 JSON 형태로 저장
- 데모 모드와 로그인 모드 모두 지원

## 🚀 최근 개발 내용 (2025-07-12)

### 1. 스마트 네비게이션 (커밋: 098159b)
**문제**: 미션 메뉴 클릭 시 항상 선택 페이지로 이동
**해결**: 
- Navigation 컴포넌트에서 진행 중인 미션 확인
- 진행 중인 미션이 있으면 → `/missions/active`로 직접 이동
- 진행 중인 미션이 없으면 → `/missions` (선택 페이지)로 이동

```typescript
// Navigation.tsx
const handleMissionClick = (e: React.MouseEvent) => {
  e.preventDefault()
  if (activeMissionsCount > 0) {
    navigate('/missions/active')
  } else {
    navigate('/missions')
  }
}
```

### 2. 미션 개수 배지 표시 (커밋: 188a6d5)
**기능**: 네비게이션 메뉴에 진행 중인 미션 개수를 배지로 표시
- 빨간색 원형 배지에 흰색 숫자
- 5초마다 자동 업데이트
- 데스크톱과 모바일 모두 지원

```typescript
{/* 미션 배지 */}
{item.name === '미션' && activeMissionsCount > 0 && (
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
    {activeMissionsCount}
  </span>
)}
```

### 3. 새 미션 추가 버튼 수정 (커밋: 246e00a)
**문제**: 진행 중인 미션 페이지에서 "새 미션 추가" 버튼이 작동하지 않음
**원인**: 자동 리다이렉트로 인한 무한 루프
**해결**: URL 쿼리 파라미터 사용

```typescript
// ActiveMissionsPage.tsx
<button onClick={() => navigate('/missions?add=true')}>
  새 미션 추가
</button>

// MissionsPage.tsx
const isAddingNew = searchParams.get('add') === 'true'
```

## 📊 상태 관리 (Zustand)

### Store 구조
```typescript
interface MissionState {
  missions: Mission[]
  addMission: (mission: Omit<Mission, 'id'>) => void
  deleteMission: (id: string) => void
  completeMissionDay: (missionId: string, date: string) => void
  uncompleteMissionDay: (missionId: string, date: string) => void
  getActiveMissions: () => Mission[]
  getMissionById: (id: string) => Mission | undefined
  getProgressPercentage: (missionId: string) => number
  getRemainingDays: (missionId: string) => number
  isDayCompleted: (missionId: string, date: string) => boolean
  canCompleteDay: (missionId: string, date: string) => boolean
}
```

### 주요 메서드
- `getActiveMissions()`: 현재 진행 중인 모든 미션 조회
- `completeMissionDay()`: 특정 날짜의 미션 완료 처리
- `getProgressPercentage()`: 미션 진행률 계산
- `canCompleteDay()`: 해당 날짜 완료 가능 여부 확인

## 🎨 UI/UX 특징

### 1. 카드 기반 디자인
- 각 미션을 카드 형태로 표시
- 그라디언트 배경색으로 미션 타입 구분
- 호버 효과로 상호작용성 강화

### 2. 진행률 시각화
- 프로그레스 바로 진행 상황 표시
- 퍼센트 수치 표시
- 남은 일수와 완료한 일수 동시 표시

### 3. 반응형 디자인
- 모바일: 1열 레이아웃
- 태블릿: 2열 그리드
- 데스크톱: 3열 그리드

## 🔄 라우팅 구조

```
/missions              # 미션 선택 페이지 (진행 중인 미션이 있으면 자동 이동)
/missions?add=true     # 새 미션 추가 시 선택 페이지
/missions/new          # 새 미션 생성 페이지
/missions/active       # 진행 중인 미션 관리 페이지
```

## 🚧 향후 개선 사항

1. **Firebase 연동**
   - 현재 localStorage → Firestore로 마이그레이션
   - 여러 기기 간 동기화 지원

2. **알림 기능**
   - 매일 미션 리마인더
   - 연속 달성 축하 메시지

3. **통계 및 분석**
   - 미션 완료율 통계
   - 연속 달성 일수 표시
   - 월별/연도별 성과 차트

4. **공유 기능**
   - 미션 달성 공유
   - 친구와 함께 미션 도전

5. **보상 시스템**
   - 미션 완료 시 포인트/뱃지
   - 연속 달성 보너스

## 📝 개발 가이드

### 새로운 미션 타입 추가하기
1. `types/missions.ts`에 새 타입 추가
2. `types/missionContent.ts`에 30일치 콘텐츠 추가
3. `MISSION_TYPE_INFO`에 메타데이터 추가

### 미션 콘텐츠 수정하기
- `types/missionContent.ts`의 `MISSIONS_BY_TYPE` 객체 수정
- 각 미션은 1일부터 30일까지의 내용을 포함해야 함

## 🐛 알려진 이슈
- 없음 (2025-07-12 기준)

---
*최종 업데이트: 2025-07-12*
