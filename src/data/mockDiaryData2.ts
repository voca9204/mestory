import { DiaryEntry } from './mockTypes'

// 추가 일기 데이터 (2025년 5월 중순 및 기타)
export const mockDiaryEntries2025MayExtra: DiaryEntry[] = [
  {
    id: '6',
    date: '2025-05-20',
    title: '프로젝트 중간 점검',
    content: `ME.STORY 프로젝트가 순조롭게 진행되고 있다.
    
    현재까지 완성된 기능:
    - 2D 타임라인 기본 구조
    - 일기 작성/편집 인터페이스
    - 사진 업로드 UI
    - 태그 시스템
    
    이제 Firebase 연동과 실제 데이터 저장 기능만 구현하면 된다.`,
    photos: [],
    mood: 'good',
    weather: '맑음',
    tags: ['개발', '중간점검'],
    wordCount: 80,
    createdAt: '2025-05-20T19:00:00Z',
    updatedAt: '2025-05-20T19:00:00Z'
  },
  {
    id: '11',
    date: '2025-05-18',
    title: '일요일 산책과 독서',
    content: `일요일 오후, 한강공원을 따라 산책했다. 날씨가 정말 좋아서 많은 사람들이 나와 있었다.

산책하면서 ME.STORY 프로젝트의 미래에 대해 생각해봤다. 단순히 일기 앱이 아니라, 사람들이 자신의 삶을 더 의미 있게 기록하고 돌아볼 수 있는 도구가 되었으면 좋겠다.

집에 돌아와서 "사용자 경험 디자인" 책을 읽었다. 특히 "감정적 디자인"에 대한 부분이 인상 깊었다. ME.STORY도 사용자의 감정과 추억을 잘 담아낼 수 있는 인터페이스를 만들어야겠다.

저녁에는 가족들과 함께 영화를 봤다. 평범하지만 소중한 일요일이었다.

내일부터 또 한 주가 시작된다. 화이팅!`,
    photos: [
      'https://images.unsplash.com/photo-1544911845-1f34cdc447cd?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '맑음',
    tags: ['산책', '한강', '독서', 'UX', '가족'],
    wordCount: 210,
    createdAt: '2025-05-18T20:15:00Z',
    updatedAt: '2025-05-18T20:15:00Z'
  },
  {
    id: '12',
    date: '2025-05-17',
    title: '주말 휴식과 계획',
    content: `오늘은 주말이라 좀 더 여유롭게 시간을 보냈다.

아침에 늦잠을 자고, 브런치를 천천히 먹으면서 ME.STORY 프로젝트의 다음 단계를 구상했다.

다음 주에 집중할 것들:
1. Firebase 연동 완료
2. 실제 일기 데이터 저장/불러오기
3. 사진 업로드 기능 구현
4. 사용자 인증 시스템

오후에는 서점에 가서 UX 디자인 관련 책을 좀 봤다. 사용자 중심의 인터페이스 설계에 대한 인사이트를 얻을 수 있었다.

저녁에는 친구들과 맥주 한 잔 하면서 프로젝트 아이디어를 공유했는데, 반응이 좋았다.`,
    photos: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '흐림',
    tags: ['주말', '휴식', '계획', '친구'],
    wordCount: 178,
    createdAt: '2025-05-17T20:30:00Z',
    updatedAt: '2025-05-17T20:30:00Z'
  },
  {
    id: '17',
    date: '2025-05-16',
    title: '버그 수정의 하루',
    content: `오늘은 하루 종일 Timeline2D 컴포넌트의 버그를 잡는데 매달렸다.

주요 해결한 문제들:
- 초기 로드 시 중앙 정렬 문제
- "오늘" 버튼 클릭 시 이동 오류
- useCallback 순환 의존성 문제

특히 transform과 scrollIntoView가 충돌하는 문제가 까다로웠는데, 수학적 계산 기반으로 완전히 새로 구현해서 해결했다.

디버깅 과정에서 콘솔 로그를 상세하게 남겨두니 문제 파악이 훨씬 쉬워졌다. 좋은 습관인 것 같다.

저녁에는 코드 리팩토링도 조금 해서 가독성을 높였다. 내일은 더 안정적인 버전이 될 것 같다.`,
    photos: [
      'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '맑음',
    tags: ['개발', '버그수정', '디버깅', '리팩토링'],
    wordCount: 192,
    createdAt: '2025-05-16T21:45:00Z',
    updatedAt: '2025-05-16T21:45:00Z'
  },
  {
    id: '13',
    date: '2025-05-13',
    title: '화요일 개발 집중',
    content: `화요일이라 그런지 집중이 잘 된다. 월요일에 세운 계획대로 하나씩 진행해나가고 있다.

오늘 진행한 작업:
1. Timeline2D 컴포넌트 마무리 터치
2. Firebase 프로젝트 설정 시작
3. 사용자 인증 시스템 설계

특히 Firebase Authentication 부분을 집중적으로 공부했다. 이메일/비밀번호 로그인은 기본이고, 구글 소셜 로그인도 추가하면 사용자 경험이 좋을 것 같다.

오후에는 팀 미팅이 있어서 ME.STORY 프로젝트 진행상황을 공유했다. 모든 팀원들이 긍정적인 반응을 보여줘서 뿌듯했다.

내일부터는 본격적인 백엔드 작업에 들어갈 예정이다.`,
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1584697964358-3e14ca57658b?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '맑음',
    tags: ['개발', '계획', 'Firebase', '팀미팅'],
    wordCount: 195,
    createdAt: '2025-05-13T18:45:00Z',
    updatedAt: '2025-05-13T18:45:00Z'
  },
  {
    id: '15',
    date: '2025-05-12',
    title: '새로운 기능 구상',
    content: `오늘은 ME.STORY에 추가할 새로운 기능들을 구상하는 시간을 가졌다.

흥미로운 아이디어들:
1. 날씨/뉴스 API 연동으로 시대적 맥락 제공
2. SNS 데이터 수집해서 일기와 연결
3. 사진의 메타데이터 분석으로 위치/시간 자동 태그
4. AI 기반 일기 요약 및 감정 분석

특히 "기전체 뷰" 아이디어가 흥미롭다. 토픽별로 일기를 분류해서 보여주는 것인데, 예를 들어 "여행", "개발", "인간관계" 같은 테마로 묶어서 볼 수 있다면 정말 유용할 것 같다.

사용자가 자신의 삶의 패턴을 더 잘 이해할 수 있을 것이다.`,
    photos: [
      'https://images.unsplash.com/photo-1553484771-371a605b060b?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1552581234-26160f608093?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['기획', '아이디어', '기능설계', 'AI'],
    wordCount: 195,
    createdAt: '2025-05-12T18:20:00Z',
    updatedAt: '2025-05-12T18:20:00Z'
  },
  {
    id: '16',
    date: '2025-05-11',
    title: '코딩 마라톤',
    content: `오늘은 정말 집중해서 코딩했다. 아침 9시부터 밤 11시까지 거의 쉬지 않고 Timeline2D 컴포넌트를 구현했다.

구현한 기능들:
- 드래그로 화면 이동
- 줌 인/아웃
- 연도별 스크롤
- 날짜 클릭 이벤트
- 월별 구분선 표시

특히 성능 최적화에 신경을 많이 썼다. 수만 개의 날짜 셀을 렌더링해도 부드럽게 작동하도록 가상화 기법을 적용했다.

피곤하지만 뿌듯한 하루였다.`,
    photos: [
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '흐림',
    tags: ['개발', '마라톤', '성능최적화'],
    wordCount: 135,
    createdAt: '2025-05-11T23:30:00Z',
    updatedAt: '2025-05-11T23:30:00Z'
  },
  {
    id: '14',
    date: '2025-05-10',
    title: '금요일의 여유',
    content: `금요일이라 그런지 조금 여유롭게 작업했다.

오전에는 코드 리뷰를 하면서 지금까지 작성한 코드를 정리했다. 주석도 추가하고, 불필요한 부분은 제거했다.

점심에는 회사 동료들과 맛있는 파스타를 먹었다. ME.STORY 프로젝트에 대해 이야기하니 다들 흥미로워했다.

오후에는 다음 주 계획을 세웠다. Firebase 연동이 가장 중요한 작업이 될 것 같다.

주말엔 좀 쉬면서 새로운 아이디어를 생각해봐야겠다.`,
    photos: [
      'https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '맑음',
    tags: ['금요일', '리뷰', '계획'],
    wordCount: 120,
    createdAt: '2025-05-10T18:00:00Z',
    updatedAt: '2025-05-10T18:00:00Z'
  }
]

// 2024년 12월 데이터
export const mockDiaryEntries2024Dec: DiaryEntry[] = [
  {
    id: '19',
    date: '2024-12-31',
    title: '2024년 마지막 날',
    content: `2024년이 끝나간다. 올해는 정말 많은 일들이 있었다.

주요 성과:
- 새로운 기술 스택 학습 (React, TypeScript, Firebase)
- 개인 프로젝트 시작
- 건강한 생활 습관 형성

아쉬웠던 점:
- 더 많은 책을 읽지 못한 것
- 운동을 꾸준히 하지 못한 것

2025년에는 ME.STORY 프로젝트를 꼭 완성하고 싶다. 100년 일기라는 컨셉이 정말 의미 있는 것 같다.

새해에는 더 나은 내가 되길!`,
    photos: [
      'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '눈',
    tags: ['연말', '회고', '다짐'],
    wordCount: 156,
    createdAt: '2024-12-31T23:00:00Z',
    updatedAt: '2024-12-31T23:00:00Z'
  },
  {
    id: '20',
    date: '2024-12-25',
    title: '크리스마스',
    content: `메리 크리스마스! 🎄

가족들과 함께 따뜻한 시간을 보냈다. 오랜만에 온 가족이 모여서 저녁을 먹고 선물을 교환했다.

특별한 선물은 아니었지만, 서로의 마음이 담긴 선물들이라 더 의미 있었다.

저녁 후에는 크리스마스 영화를 보면서 핫초코를 마셨다. 이런 소소한 행복이 진짜 행복인 것 같다.`,
    photos: [
      'https://images.unsplash.com/photo-1543934638-bd2e138430c4?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '눈',
    tags: ['크리스마스', '가족', '행복'],
    wordCount: 98,
    createdAt: '2024-12-25T21:00:00Z',
    updatedAt: '2024-12-25T21:00:00Z'
  }
]

// 2023년 데이터 샘플
export const mockDiaryEntries2023: DiaryEntry[] = [
  {
    id: '21',
    date: '2023-08-15',
    title: '여름휴가 제주도',
    content: `제주도로 여름휴가를 왔다! 

첫날인 오늘은 성산일출봉을 올랐다. 생각보다 힘들었지만 정상에서 본 풍경은 정말 장관이었다.

오후에는 섭지코지를 둘러보고, 저녁에는 흑돼지를 먹었다. 제주도의 자연과 음식, 모든 것이 완벽했다.

내일은 한라산에 도전해볼 예정이다. 날씨가 좋기를!`,
    photos: [
      'https://images.unsplash.com/photo-1551776235-dde6d482980b?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['여행', '제주도', '휴가'],
    wordCount: 103,
    createdAt: '2023-08-15T20:00:00Z',
    updatedAt: '2023-08-15T20:00:00Z'
  }
]