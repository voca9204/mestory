export interface DiaryEntry {
  id: string
  date: string // YYYY-MM-DD format
  title: string
  content: string
  photos: string[]
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
  weather?: string
  tags: string[]
  wordCount: number
  createdAt: string
  updatedAt: string
}

export interface ContextData {
  date: string
  weather: {
    temperature: number
    condition: string
    humidity: number
  }
  news: string[]
  events: string[]
}

// 가상 일기 데이터
export const mockDiaryEntries: DiaryEntry[] = [
  {
    id: '1',
    date: '2025-05-25',
    title: '2D 타임라인 다중 연도 뷰 완성',
    content: `오늘은 ME.STORY의 2D 타임라인에서 중요한 개선을 이뤘다!

사용자가 지적한 문제를 해결했다:
- 연도 범위를 2020-2035년으로 확장
- 다중 연도가 한눈에 보이도록 레이아웃 개선
- 데이터 소스 일관성 문제 해결

이제 Timeline2D와 DiaryPage가 모두 동일한 mockData를 참조한다. 버그 수정과 동시에 사용자 경험도 크게 개선되었다.

정말 뿌듯한 하루! 🎉`,
    photos: [
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['개발', 'ME.STORY', '버그수정', 'UX개선'],
    wordCount: 150,
    createdAt: '2025-05-25T19:30:00Z',
    updatedAt: '2025-05-25T19:30:00Z'
  },
  {
    id: '2',
    date: '2025-05-24',
    title: 'ME.STORY 프로토타입 완성',
    content: `오늘은 ME.STORY 프로젝트의 프로토타입을 완성한 날이다!

2D 타임라인이 정말 멋지게 구현되었고, 수평(월일) × 수직(연도) 방식으로 원하던 대로 만들어졌다.

주요 완성된 기능들:
- 2D 타임라인 네비게이션
- 일기 작성 및 편집
- 사진 업로드 인터페이스
- 깔끔한 UI/UX

앞으로 Firebase 연동과 실제 데이터 저장 기능을 추가하면 완전한 100년 일기 앱이 될 것 같다. 정말 뿌듯한 하루였다! 🎉`,
    photos: [
      'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555949963-f1fba6fdd5ff?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['개발', '프로젝트', '성과'],
    wordCount: 240,
    createdAt: '2025-05-24T21:30:00Z',
    updatedAt: '2025-05-24T21:30:00Z'
  },
  {
    id: '3',
    date: '2025-05-23',
    title: '카페에서의 집중 코딩',
    content: `오늘은 홍대 근처 조용한 카페에서 하루 종일 코딩을 했다.

Timeline2D 컴포넌트를 구현하는데 생각보다 복잡했다. 특히 년도별 데이터를 수평으로 배치하면서 성능을 최적화하는 부분이 까다로웠다.

하지만 결국 해냈다! 마우스 드래그, 줌, 그리고 범례까지 모든 기능이 원활하게 작동한다.

카페 아메리카노 3잔과 크로와상 하나로 버틴 하루. 집중력이 정말 좋았다.

내일은 일기 작성 기능을 완성해야겠다.`,
    photos: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559496417-e7f25cb247cd?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '흐림',
    tags: ['개발', '카페', '집중'],
    wordCount: 198,
    createdAt: '2025-05-23T22:15:00Z',
    updatedAt: '2025-05-23T22:15:00Z'
  },
  {
    id: '4',
    date: '2025-05-22',
    title: '프로젝트 기획 회의',
    content: `ME.STORY 프로젝트의 전체적인 방향을 정하는 중요한 하루였다.

아침에 PRD를 작성하면서 프로젝트의 핵심 가치를 다시 한번 명확히 했다:
1. 개인의 삶을 완전히 기록
2. 시대적 맥락과 함께 보기
3. 100년 아카이브의 가능성

특히 "편년체"와 "기전체" 뷰 모드 아이디어가 정말 마음에 든다. 시간순으로 보다가 토픽별로도 볼 수 있다는 게 혁신적이다.

기술 스택도 Vite + React + Firebase로 확정. 빠른 프로토타이핑에 최적인 조합이다.`,
    photos: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '맑음',
    tags: ['기획', '회의', '아이디어'],
    wordCount: 187,
    createdAt: '2025-05-22T19:45:00Z',
    updatedAt: '2025-05-22T19:45:00Z'
  },
  {
    id: '5',
    date: '2025-05-21',
    title: '영감을 얻은 하루',
    content: `오늘 GitHub에서 정말 흥미로운 프로젝트들을 발견했다.

특히 시간 시각화 관련 프로젝트들을 보면서 ME.STORY의 2D 타임라인 아이디어가 떠올랐다. 기존의 달력 UI는 너무 제한적이다. 

수평으로는 월/일을, 수직으로는 연도를 배치하면 어떨까? 그러면 같은 날짜의 여러 해를 한눈에 비교할 수 있을 것이다.

예를 들어, 내 생일인 3월 15일의 2020년, 2021년, 2022년을 세로로 쭉 볼 수 있다면? 정말 흥미로울 것 같다.

이 아이디어를 바탕으로 내일부터 본격적인 개발에 들어가야겠다.`,
    photos: [
      'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['영감', '아이디어', '개발'],
    wordCount: 203,
    createdAt: '2025-05-21T23:20:00Z',
    updatedAt: '2025-05-21T23:20:00Z'
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

가장 까다로웠던 부분:
- 366일 전체를 렌더링하면서 성능 유지하기
- 줌/드래그 기능과 날짜 선택 기능 조화
- 년도별 레이아웃 계산 로직

React의 useCallback과 useMemo를 적극 활용해서 불필요한 리렌더링을 방지했다. 특히 년도 배열 생성 로직을 메모이제이션해서 성능이 크게 개선되었다.

저녁에는 피자를 시켜먹으면서 코딩을 계속했는데, 이런 몰입감이 개발의 매력인 것 같다.

내일은 버그 테스트와 사용성 개선에 집중해야겠다.`,
    photos: [
      'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '비',
    tags: ['개발', '몰입', '성능최적화', '코딩마라톤'],
    wordCount: 208,
    createdAt: '2025-05-11T23:30:00Z',
    updatedAt: '2025-05-11T23:30:00Z'
  },
  {
    id: '6',
    date: '2025-04-15',
    title: '벚꽃 구경',
    content: `오늘은 여의도 한강공원에 벚꽃 구경을 갔다.

코로나 이후 오랜만에 이렇게 많은 사람들과 함께 야외 활동을 했다. 벚꽃이 정말 예뻤고, 사진도 많이 찍었다.

친구들과 함께 돗자리 깔고 치킨과 맥주를 먹으면서 이런저런 이야기를 나눴다. 일상의 소중함을 다시 한번 느꼈다.

이런 순간들을 기록으로 남기고 싶다는 생각이 들었다. 나중에 몇 년 후에 이 날을 돌아보면 어떨까?

ME.STORY 아이디어의 출발점이 된 소중한 하루였다.`,
    photos: [
      'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1587573089615-0da723936ed3?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1517639493569-5666b8b1f1c3?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['벚꽃', '친구', '한강', '봄'],
    wordCount: 178,
    createdAt: '2025-04-15T20:30:00Z',
    updatedAt: '2025-04-15T20:30:00Z'
  },
  {
    id: '14',
    date: '2025-03-15',
    title: '생일 맞이',
    content: `오늘은 내 생일이다. 32살이 되었다.

아침에 가족들과 함께 브런치를 먹고, 오후에는 친구들과 영화를 봤다. 저녁에는 연인과 함께 근사한 레스토랑에서 디너를 했다.

생일을 맞아 지난 한 해를 돌아보니 정말 많은 일들이 있었다. 새로운 회사로 이직하고, 여러 프로젝트를 성공적으로 완료했다.

32살의 목표는 더 의미 있는 프로젝트를 만드는 것이다. 사람들의 삶에 실질적인 도움이 되는 것들을 만들고 싶다.

올해도 건강하고 행복하게 보내자!`,
    photos: [
      'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['생일', '가족', '친구', '회고'],
    wordCount: 176,
    createdAt: '2025-03-15T23:45:00Z',
    updatedAt: '2025-03-15T23:45:00Z'
  },
  {
    id: '7',
    date: '2025-01-01',
    title: '새해 첫날',
    content: `2025년이 시작되었다!

작년을 돌아보니 개인적으로나 전문적으로나 많은 성장이 있었던 해였다. 새로운 기술들을 배웠고, 좋은 사람들을 만났다.

올해의 목표:
1. 개인 프로젝트 3개 이상 완성하기
2. 새로운 기술 스택 마스터하기 (Firebase, Three.js)
3. 건강 관리 - 주 3회 이상 운동하기
4. 독서 월 2권 이상
5. 여행 2회 이상

특히 올해는 "ME.STORY" 같은 개인적인 프로젝트에 더 집중하고 싶다. 기술을 활용해서 사람들의 일상을 더 풍부하게 만드는 도구를 만들어보자.

새해 복 많이 받으세요! 🎉`,
    photos: [
      'https://images.unsplash.com/photo-1546195643-70986d8b4d04?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1577653726617-33edddf63ae9?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1609171880736-3a4b22b8ce84?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '추움',
    tags: ['새해', '목표', '다짐'],
    wordCount: 189,
    createdAt: '2025-01-01T23:59:00Z',
    updatedAt: '2025-01-01T23:59:00Z'
  },
  {
    id: '8',
    date: '2024-12-25',
    title: '크리스마스',
    content: `메리 크리스마스! 🎄

오늘은 가족들과 함께 조용한 크리스마스를 보냈다. 아침에 선물 교환을 하고, 어머니가 해주신 특제 크리스마스 브런치를 먹었다.

오후에는 친구들과 카페에서 만나 올 한 해를 정리하는 시간을 가졌다. 다들 각자의 자리에서 열심히 살아가고 있다는 것이 대견하고 고마웠다.

저녁에는 혼자만의 시간을 가지며 책을 읽었다. "디지털 미니멀리즘"이라는 책인데, 기술과 인간의 관계에 대해 생각해볼 수 있는 좋은 내용이었다.

평화롭고 따뜻한 크리스마스였다.`,
    photos: [
      'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1544946503-7ad5ac882d5d?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1576919228236-a097c32a5cd4?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '눈',
    tags: ['크리스마스', '가족', '친구', '독서'],
    wordCount: 167,
    createdAt: '2024-12-25T22:00:00Z',
    updatedAt: '2024-12-25T22:00:00Z'
  },
  {
    id: '9',
    date: '2024-11-15',
    title: '단풍구경 여행',
    content: `경주로 단풍구경 여행을 다녀왔다.

불국사와 석굴암을 둘러보며 가을의 정취를 만끽했다. 특히 불국사의 단풍이 정말 아름다웠다. 빨강, 노랑, 주황색이 조화롭게 어우러진 모습이 마치 자연이 그린 그림 같았다.

첨성대 주변에서 야경도 보고, 황리단길에서 맛있는 음식도 먹었다. 경주 빵과 찰보리빵이 특히 인상적이었다.

2박 3일의 짧은 여행이었지만 정말 알찬 시간이었다. 일상에서 벗어나 자연과 역사를 느낄 수 있어서 좋았다.

다음에는 봄에 벚꽃 필 때 다시 와봐야겠다.`,
    photos: [
      'https://images.unsplash.com/photo-1570979342785-ddd65daf17d4?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1603794067602-9feaa4ba150e?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['여행', '경주', '단풍', '힐링'],
    wordCount: 185,
    createdAt: '2024-11-15T21:30:00Z',
    updatedAt: '2024-11-15T21:30:00Z'
  },
  {
    id: '10',
    date: '2024-10-31',
    title: '할로윈 코스튬 파티',
    content: `오늘은 친구들과 할로윈 파티를 했다!

나는 해리포터 코스튬을 입고 갔는데, 생각보다 반응이 좋았다. 친구들도 각자 창의적인 코스튬을 준비해와서 정말 재미있었다.

가장 인상적이었던 건 민수가 준비한 좀비 메이크업이었다. 진짜 무서워서 처음에 깜짝 놀랐다. ㅋㅋ

홍대 클럽가에서 할로윈 분위기를 만끽하고, 새벽까지 춤을 추며 놀았다. 오랜만에 이렇게 신나게 논 것 같다.

어른이 되어서도 이런 이벤트를 즐길 수 있다는 게 참 좋다. 내 나이에도 동심을 잃지 않고 살아가고 싶다.`,
    photos: [
      'https://images.unsplash.com/photo-1509557965043-6e4954b14e04?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['할로윈', '파티', '친구', '코스튬'],
    wordCount: 179,
    createdAt: '2024-10-31T23:45:00Z',
    updatedAt: '2024-10-31T23:45:00Z'
  }
]

// 가상 맥락 데이터
export const mockContextData: ContextData[] = [
  {
    date: '2025-05-24',
    weather: {
      temperature: 22,
      condition: '맑음',
      humidity: 45
    },
    news: [
      'IT 업계 새로운 AI 도구 출시',
      '한국 경제 성장률 전망 발표',
      '서울시 친환경 교통정책 시행'
    ],
    events: ['ME.STORY 프로토타입 완성']
  },
  {
    date: '2025-05-23',
    weather: {
      temperature: 19,
      condition: '흐림',
      humidity: 65
    },
    news: [
      '글로벌 기업 원격근무 정책 변화',
      '새로운 카페 프랜차이즈 급성장',
      '개발자 채용 시장 동향'
    ],
    events: ['홍대 카페 코딩 세션']
  },
  {
    date: '2025-04-15',
    weather: {
      temperature: 18,
      condition: '맑음',
      humidity: 40
    },
    news: [
      '전국 벚꽃 개화 현황',
      '봄 나들이 관련 교통 정보',
      '한강공원 이용객 증가'
    ],
    events: ['여의도 벚꽃축제 개최']
  },
  {
    date: '2025-03-15',
    weather: {
      temperature: 15,
      condition: '맑음',
      humidity: 35
    },
    news: [
      '3월 취업 시장 동향',
      '봄 시즌 레스토랑 예약 증가',
      '생일 선물 트렌드 변화'
    ],
    events: ['개인 생일']
  }
]

// 헬퍼 함수들
export const getDiaryByDate = (date: string): DiaryEntry | undefined => {
  return mockDiaryEntries.find(entry => entry.date === date)
}

export const getDiaryByDateObj = (date: Date): DiaryEntry | undefined => {
  // 시간대 문제 방지를 위한 로컬 날짜 문자열 생성
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return mockDiaryEntries.find(entry => entry.date === dateString)
}

export const getContextByDate = (date: string): ContextData | undefined => {
  return mockContextData.find(context => context.date === date)
}

export const getRecentDiaries = (limit: number = 5): DiaryEntry[] => {
  return mockDiaryEntries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
}

export const getDiariesByDateRange = (startDate: string, endDate: string): DiaryEntry[] => {
  return mockDiaryEntries.filter(entry => {
    const entryDate = new Date(entry.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return entryDate >= start && entryDate <= end
  })
}

export const hasDataForDate = (date: Date): boolean => {
  // 시간대 문제 방지를 위한 로컬 날짜 문자열 생성
  const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return mockDiaryEntries.some(entry => entry.date === dateString)
}

export const getDiaryCountByMonth = (year: number, month: number): number => {
  return mockDiaryEntries.filter(entry => {
    const entryDate = new Date(entry.date)
    return entryDate.getFullYear() === year && entryDate.getMonth() === month - 1
  }).length
}