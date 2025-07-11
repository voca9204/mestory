import { DiaryEntry } from './mockTypes'

// 가상 일기 데이터 - 2025년 5월 데이터
export const mockDiaryEntries2025May: DiaryEntry[] = [
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
    tags: ['개발', 'ME.STORY', '프로토타입', '성취'],
    wordCount: 180,
    createdAt: '2025-05-24T20:30:00Z',
    updatedAt: '2025-05-24T20:30:00Z'
  }
]

// 2025년 5월 15일부터 19일까지 데이터는 간략하게
export const mockDiaryEntries2025MayMid: DiaryEntry[] = [
  {
    id: '3',
    date: '2025-05-19',
    title: '프론트엔드 개발 진행',
    content: '2D 타임라인 UI 컴포넌트를 개발하고 있다. 생각보다 복잡해서 시간이 걸리지만 차근차근 진행중이다.',
    photos: [],
    mood: 'neutral',
    weather: '흐림',
    tags: ['개발', '진행중'],
    wordCount: 45,
    createdAt: '2025-05-19T21:00:00Z',
    updatedAt: '2025-05-19T21:00:00Z'
  }
]

// 2025년 4월 데이터
export const mockDiaryEntries2025April: DiaryEntry[] = [
  {
    id: '7',
    date: '2025-04-15',
    title: '세금 신고 완료',
    content: '연말정산 서류를 모두 정리해서 세금 신고를 완료했다. 환급금이 생각보다 많이 나왔다!',
    photos: [],
    mood: 'good',
    weather: '맑음',
    tags: ['일상', '세금'],
    wordCount: 40,
    createdAt: '2025-04-15T18:00:00Z',
    updatedAt: '2025-04-15T18:00:00Z'
  }
]

// 2025년 3월 데이터
export const mockDiaryEntries2025March: DiaryEntry[] = [
  {
    id: '8',
    date: '2025-03-28',
    title: '벚꽃 만개',
    content: '회사 근처 공원의 벚꽃이 만개했다. 점심시간에 동료들과 함께 산책하며 봄을 만끽했다.',
    photos: [
      'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['봄', '벚꽃', '산책'],
    wordCount: 35,
    createdAt: '2025-03-28T13:00:00Z',
    updatedAt: '2025-03-28T13:00:00Z'
  }
]

// 2025년 2월 데이터
export const mockDiaryEntries2025Feb: DiaryEntry[] = [
  {
    id: '9',
    date: '2025-02-14',
    title: '발렌타인데이',
    content: '특별한 날은 아니지만 초콜릿을 하나 받았다. 달콤했다.',
    photos: [],
    mood: 'good',
    weather: '눈',
    tags: ['발렌타인', '초콜릿'],
    wordCount: 25,
    createdAt: '2025-02-14T20:00:00Z',
    updatedAt: '2025-02-14T20:00:00Z'
  }
]

// 2025년 1월 데이터
export const mockDiaryEntries2025Jan: DiaryEntry[] = [
  {
    id: '10',
    date: '2025-01-01',
    title: '새해 첫날',
    content: '2025년이 시작되었다. 올해는 100년 일기 프로젝트를 꼭 완성하고 싶다.',
    photos: [
      'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['새해', '결심', '시작'],
    wordCount: 30,
    createdAt: '2025-01-01T00:30:00Z',
    updatedAt: '2025-01-01T00:30:00Z'
  }
]

// 모든 일기 데이터 합치기
export const mockDiaryEntries: DiaryEntry[] = [
  ...mockDiaryEntries2025May,
  ...mockDiaryEntries2025MayMid,
  ...mockDiaryEntries2025April,
  ...mockDiaryEntries2025March,
  ...mockDiaryEntries2025Feb,
  ...mockDiaryEntries2025Jan
]