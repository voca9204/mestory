import { DiaryEntry } from './mockTypes'

// 호버 툴팁 테스트용 데이터 및 추가 데이터
export const mockDiaryEntriesTest: DiaryEntry[] = [
  {
    id: '18',
    date: '2025-05-14',
    title: '미래의 일기 테스트',
    content: `이 일기는 미래 날짜 테스트를 위한 것이다.
    
    Timeline2D에서 미래 날짜도 제대로 표시되는지 확인하기 위해 작성했다.
    
    미래에 대한 계획이나 목표를 미리 적어두는 것도 좋을 것 같다.`,
    photos: [],
    mood: 'neutral',
    weather: '맑음',
    tags: ['테스트', '미래'],
    wordCount: 65,
    createdAt: '2025-05-14T10:00:00Z',
    updatedAt: '2025-05-14T10:00:00Z'
  },
  {
    id: '22',
    date: '2025-06-01',
    title: '6월의 시작',
    content: `6월이 시작되었다. 이제 2025년도 반이 지나간다.
    
    ME.STORY 프로젝트도 많이 진전되었고, 이제 실사용이 가능한 수준까지 왔다.
    
    하반기에는 더 많은 기능을 추가하고, 사용자들의 피드백을 받아서 개선해나가고 싶다.`,
    photos: [
      'https://images.unsplash.com/photo-1554478329-6e6b2d8d8ba3?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '맑음',
    tags: ['6월', '계획', '목표'],
    wordCount: 78,
    createdAt: '2025-06-01T09:00:00Z',
    updatedAt: '2025-06-01T09:00:00Z'
  },
  {
    id: '23',
    date: '2025-06-15',
    title: '호버 툴팁 테스트용 일기 - 매우 긴 제목이 있는 경우 툴팁에서 어떻게 표시되는지 확인하기 위한 테스트',
    content: `이 일기는 호버 툴팁에서 긴 제목과 긴 내용이 어떻게 표시되는지 테스트하기 위한 일기입니다.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

이처럼 매우 긴 내용을 가진 일기에서 호버 툴팁이 제대로 표시되는지, 그리고 line-clamp가 잘 작동하는지 확인할 수 있습니다.

더 많은 내용을 추가해서 툴팁의 스크롤이나 높이 제한이 제대로 작동하는지도 테스트해보겠습니다.

이런 긴 내용도 툴팁에서 적절히 잘려서 표시되어야 합니다.`,
    photos: [
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=300&fit=crop'
    ],
    mood: 'neutral',
    weather: '흐림',
    tags: ['테스트', '긴내용', '툴팁검증', 'UI테스트', 'Lorem'],
    wordCount: 423,
    createdAt: '2025-06-15T14:30:00Z',
    updatedAt: '2025-06-15T14:30:00Z'
  },
  {
    id: '24',
    date: '2025-06-18',
    title: '짧은 일기',
    content: `오늘은 간단한 일기.

날씨가 좋았다. 산책했다. 커피 마셨다.

끝.`,
    photos: [],
    mood: 'neutral',
    weather: '맑음',
    tags: ['간단', '짧음'],
    wordCount: 25,
    createdAt: '2025-06-18T20:15:00Z',
    updatedAt: '2025-06-18T20:15:00Z'
  },
  {
    id: '25',
    date: '2025-06-20',
    title: '사진이 많은 일기',
    content: `오늘은 사진을 정말 많이 찍었다!

아침에 카페에서 시작해서, 점심에는 맛집, 오후에는 전시회, 저녁에는 야경까지... 하루 종일 카메라를 손에서 놓지 않았다.

특히 전시회에서 본 작품들이 정말 인상적이었다. 현대미술의 새로운 경향을 볼 수 있어서 좋았다.

호버 툴팁에서 사진 썸네일들이 어떻게 표시되는지도 확인해보자.`,
    photos: [
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '맑음',
    tags: ['사진', '전시회', '카페', '야경'],
    wordCount: 134,
    createdAt: '2025-06-20T23:45:00Z',
    updatedAt: '2025-06-20T23:45:00Z'
  },
  {
    id: '26',
    date: '2025-06-22',
    title: '기분이 좋지 않은 날',
    content: `오늘은 왠지 모르게 기분이 좋지 않았다.

별다른 이유는 없는데 그냥 우울했다. 이런 날도 있는 거겠지.

집에서 조용히 음악을 들으며 시간을 보냈다. 가끔은 이런 시간도 필요한 것 같다.

내일은 더 좋은 하루가 되길 바란다.`,
    photos: [
      'https://images.unsplash.com/photo-1534274867514-bd6bd4c677ee?w=500&h=300&fit=crop'
    ],
    mood: 'bad',
    weather: '흐림',
    tags: ['우울', '휴식', '음악'],
    wordCount: 87,
    createdAt: '2025-06-22T19:20:00Z',
    updatedAt: '2025-06-22T19:20:00Z'
  },
  {
    id: '27',
    date: '2025-06-25',
    title: '중간 길이 제목 테스트용',
    content: `중간 정도 길이의 제목과 내용을 가진 일기입니다.

호버 툴팁에서 다양한 길이의 제목과 내용들이 어떻게 표시되는지 테스트하기 위한 것입니다.

오늘은 날씨가 정말 좋았고, 산책을 하면서 여러 생각들을 정리할 수 있었습니다.

ME.STORY 프로젝트도 점점 완성되어 가고 있어서 뿌듯합니다.`,
    photos: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
      'https://images.unsplash.com/photo-1471157508510-5b45e5c0aed0?w=500&h=300&fit=crop'
    ],
    mood: 'good',
    weather: '맑음',
    tags: ['중간', '테스트', '산책', '프로젝트'],
    wordCount: 112,
    createdAt: '2025-06-25T16:40:00Z',
    updatedAt: '2025-06-25T16:40:00Z'
  },
  {
    id: '28',
    date: '2025-06-28',
    title: '6월 마무리',
    content: `6월이 거의 끝나간다.

이번 달은 정말 많은 것을 이뤘다. Timeline2D UX 개선, 호버 툴팁 구현, 테스트 데이터 추가... 모든 Task를 성공적으로 완료했다.

특히 호버 툴팁 기능이 정말 잘 작동해서 뿌듯하다. 사용자들이 일기 내용을 더 쉽게 미리볼 수 있게 되었다.

7월에는 또 어떤 새로운 기능들을 추가할까? 기대된다!`,
    photos: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=300&fit=crop'
    ],
    mood: 'great',
    weather: '맑음',
    tags: ['마무리', '성취', '기대', '7월'],
    wordCount: 128,
    createdAt: '2025-06-28T21:00:00Z',
    updatedAt: '2025-06-28T21:00:00Z'
  }
]