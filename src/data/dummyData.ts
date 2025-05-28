// 더미 일기 데이터
export interface DiaryEntry {
  id: string
  date: string // YYYY-MM-DD 형식
  title: string
  content: string
  photos: string[]
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'
  weather?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export const dummyDiaries: DiaryEntry[] = [
  {
    id: '1',
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
    photos: [],
    mood: 'great',
    weather: '맑음',
    tags: ['개발', '프로젝트', '성취'],
    createdAt: '2025-05-24T10:30:00Z',
    updatedAt: '2025-05-24T14:45:00Z'
  },
  {
    id: '2',
    date: '2025-05-20',
    title: '새로운 아이디어 구상',
    content: `100년 일기라는 아이디어를 처음 떠올린 날이다. 

편년체와 기전체를 모두 지원하는 방식으로, 개인의 기록과 시대적 맥락을 함께 보여주는 앱을 만들어보자는 생각이 들었다. 

특히 2D 네비게이션 아이디어가 흥미롭다:
- 수평축: 월일 (1년의 흐름)
- 수직축: 연도 (시간의 흐름)

이렇게 하면 "이맘때 지난해엔 뭘 했을까?"를 쉽게 확인할 수 있을 것 같다.`,
    photos: [],
    mood: 'good',
    weather: '흐림',
    tags: ['아이디어', '계획', '일기'],
    createdAt: '2025-05-20T20:15:00Z',
    updatedAt: '2025-05-20T20:45:00Z'
  },
  {
    id: '16',
    date: '2025-05-21',
    title: '프로젝트 진전',
    content: `오늘은 ME.STORY 프로젝트에서 중요한 진전이 있었다. 

2D 타임라인의 기본 기능들이 거의 완성되어가고 있다. 특히 다중 연도 표시 기능을 구현해서 사용자가 여러 해의 기록을 한눈에 볼 수 있게 되었다.

버그들도 하나씩 해결해나가고 있어서 뿌듯하다. 내일은 Firebase 연동 작업을 시작할 예정이다.`,
    photos: [],
    mood: 'good',
    weather: '맑음',
    tags: ['개발', '프로젝트', '진전', 'ME.STORY'],
    createdAt: '2025-05-21T18:30:00Z',
    updatedAt: '2025-05-21T18:45:00Z'
  },
  {
    id: '3',
    date: '2025-05-15',
    title: '봄나들이',
    content: `오늘은 한강공원에 나들이를 갔다. 날씨가 정말 좋았고, 벚꽃이 만개해서 너무 아름다웠다.

가족들과 함께 피크닉을 하며 오랜만에 여유로운 시간을 보냈다. 아이들이 뛰어노는 모습을 보니 마음이 편안해졌다.

사진도 많이 찍었는데, 특히 벚꽃과 함께 찍은 가족사진이 마음에 든다. 이런 순간들이 삶의 소중함을 일깨워준다.`,
    photos: ['cherry_blossom_1.jpg', 'family_picnic.jpg'],
    mood: 'great',
    weather: '맑음',
    tags: ['가족', '나들이', '벚꽃', '한강'],
    createdAt: '2025-05-15T19:30:00Z',
    updatedAt: '2025-05-15T19:45:00Z'
  },
  {
    id: '13',
    date: '2025-05-16',
    title: '프로젝트 기획 회의',
    content: `오늘은 새로운 프로젝트 기획 회의가 있었다. 팀원들과 함께 아이디어를 나누고 방향성을 정했다.

특히 사용자 경험에 대한 부분에서 많은 토론이 있었다. 모든 팀원이 적극적으로 참여해서 좋은 아이디어들이 많이 나왔다.

다음 주부터 본격적인 개발에 들어갈 예정이다. 기대가 되는 동시에 책임감도 느껴진다.`,
    photos: [],
    mood: 'good',
    weather: '맑음',
    tags: ['회의', '기획', '팀워크', '프로젝트'],
    createdAt: '2025-05-16T17:30:00Z',
    updatedAt: '2025-05-16T17:45:00Z'
  },
  {
    id: '14',
    date: '2025-05-11',
    title: '코딩 테스트 준비',
    content: `오늘은 하루 종일 코딩 테스트 준비를 했다. 알고리즘 문제들을 풀면서 논리적 사고력을 기르고 있다.

특히 동적 계획법 문제가 어려웠는데, 몇 시간 고민 끝에 해결할 수 있었다. 이런 성취감이 개발의 즐거움인 것 같다.

꾸준히 연습하면 분명 실력이 늘 것이라고 생각한다. 목표를 향해 한 걸음씩 나아가고 있다.`,
    photos: [],
    mood: 'good',
    weather: '흐림',
    tags: ['코딩테스트', '알고리즘', '공부', '성장'],
    createdAt: '2025-05-11T21:15:00Z',
    updatedAt: '2025-05-11T21:30:00Z'
  },
  {
    id: '6',
    date: '2025-05-10',
    title: '새로운 도전',
    content: `오늘부터 새로운 프로젝트를 시작했다. 조금 불안하기도 하지만 설레는 마음이 더 크다.

새로운 기술 스택을 배우면서 성장할 수 있는 기회라고 생각한다. React와 Firebase를 더 깊이 있게 다뤄볼 예정이다.

팀원들도 모두 열정적이어서 좋은 결과가 나올 것 같다. 함께 성장하는 경험이 될 것 같아 기대된다.`,
    photos: [],
    mood: 'good',
    weather: '비',
    tags: ['프로젝트', '새로운시작', '팀워크'],
    createdAt: '2025-05-10T22:00:00Z',
    updatedAt: '2025-05-10T22:15:00Z'
  },
  {
    id: '5',
    date: '2025-05-01',
    title: '어린이날',
    content: `어린이날이라서 조카들과 함께 시간을 보냈다. 놀이공원에 가서 하루 종일 신나게 놀았다.

롤러코스터를 처음 타는 조카를 보니 나도 어릴 때가 생각났다. 무서워하면서도 또 타고 싶어하는 모습이 귀여웠다.

저녁에는 온 가족이 모여서 식사를 했다. 이런 날들이 있어서 삶이 더 의미 있는 것 같다.`,
    photos: ['kids_day_1.jpg', 'amusement_park.jpg'],
    mood: 'great',
    weather: '맑음',
    tags: ['어린이날', '가족', '놀이공원'],
    createdAt: '2025-05-01T21:30:00Z',
    updatedAt: '2025-05-01T21:45:00Z'
  },
  {
    id: '15',
    date: '2025-04-25',
    title: '독서의 즐거움',
    content: `오랜만에 책을 읽는 시간을 가졌다. 요즘 바빠서 책 읽을 시간이 없었는데, 오늘은 의식적으로 시간을 내서 읽었다.

"사피엔스"라는 책인데, 인류의 역사에 대한 새로운 관점을 제시해서 매우 흥미로웠다. 특히 인지혁명 부분이 인상 깊었다.

역시 독서는 생각의 폭을 넓혀주는 것 같다. 앞으로 더 자주 책을 읽는 시간을 가져야겠다.`,
    photos: [],
    mood: 'good',
    weather: '흐림',
    tags: ['독서', '사피엔스', '학습'],
    createdAt: '2025-04-25T23:15:00Z',
    updatedAt: '2025-04-25T23:30:00Z'
  },
  {
    id: '7',
    date: '2025-04-20',
    title: '운동 시작',
    content: `오늘부터 다시 운동을 시작했다. 헬스장에 등록하고 첫 운동을 했는데, 생각보다 체력이 많이 떨어져있었다.

하지만 시작이 반이라고 하니까, 꾸준히 해보자는 다짐을 했다. 일주일에 3번은 가는 것을 목표로 정했다.

건강한 몸과 마음을 위해서는 운동이 필수인 것 같다. 예전처럼 활기찬 몸으로 돌아가고 싶다.`,
    photos: [],
    mood: 'good',
    weather: '맑음',
    tags: ['운동', '헬스', '건강', '다짐'],
    createdAt: '2025-04-20T20:45:00Z',
    updatedAt: '2025-04-20T21:00:00Z'
  },
  {
    id: '8',
    date: '2025-04-15',
    title: '친구와의 만남',
    content: `오랜만에 대학 동기들과 만났다. 코로나 이후로 처음 모이는 자리였는데, 모두 많이 변해있었다.

각자의 근황을 이야기하며 시간 가는 줄 몰랐다. 누구는 결혼했고, 누구는 이직했고, 모두 각자의 길을 걸어가고 있었다.

이런 만남이 있어서 대학 시절이 더 그리워진다. 앞으로 더 자주 만나자고 약속했다.`,
    photos: ['friends_meeting.jpg'],
    mood: 'great',
    weather: '맑음',
    tags: ['친구', '대학동기', '만남', '추억'],
    createdAt: '2025-04-15T23:00:00Z',
    updatedAt: '2025-04-15T23:15:00Z'
  },
  {
    id: '9',
    date: '2025-04-10',
    title: '비 오는 날',
    content: `하루 종일 비가 내렸다. 이런 날엔 집에서 조용히 시간을 보내는 것이 좋다.

창가에 앉아서 빗방울이 떨어지는 소리를 들으며 차를 마셨다. 평소보다 여유로운 마음으로 하루를 보낼 수 있었다.

비 오는 날의 특별한 분위기가 있다. 세상이 조금 더 조용해지고, 내 마음도 차분해지는 느낌이다.`,
    photos: [],
    mood: 'neutral',
    weather: '비',
    tags: ['비', '여유', '휴식', '차'],
    createdAt: '2025-04-10T21:20:00Z',
    updatedAt: '2025-04-10T21:35:00Z'
  },
  {
    id: '10',
    date: '2025-04-05',
    title: '새로운 취미',
    content: `오늘 처음으로 요리 클래스에 다녀왔다. 이탈리안 파스타 만드는 법을 배웠는데, 생각보다 재미있었다.

처음에는 서툴렀지만, 선생님의 도움으로 맛있는 파스타를 완성할 수 있었다. 직접 만든 음식을 먹는 기쁨이 이런 것이구나.

앞으로 더 다양한 요리를 배워보고 싶다. 새로운 취미가 생긴 것 같아서 기쁘다.`,
    photos: ['pasta_cooking.jpg'],
    mood: 'great',
    weather: '맑음',
    tags: ['요리', '파스타', '취미', '새로운경험'],
    createdAt: '2025-04-05T19:45:00Z',
    updatedAt: '2025-04-05T20:00:00Z'
  },
  // 2024년 데이터
  {
    id: '11',
    date: '2024-12-31',
    title: '2024년을 마무리하며',
    content: `2024년의 마지막 날이다. 올해는 정말 많은 일들이 있었다.

새로운 도전들, 성공과 실패, 기쁨과 슬픔... 모든 경험들이 나를 성장시켜준 것 같다.

2025년에는 더 발전된 모습이 되기를 바라며, 새로운 목표들을 세워보자. 건강하고 행복한 새해가 되기를!`,
    photos: [],
    mood: 'good',
    weather: '추움',
    tags: ['연말', '회고', '새해다짐'],
    createdAt: '2024-12-31T23:45:00Z',
    updatedAt: '2024-12-31T23:59:00Z'
  },
  {
    id: '12',
    date: '2024-11-15',
    title: '단풍구경',
    content: `내장산에 단풍구경을 갔다. 가을의 절정이라고 할 만큼 아름다운 단풍을 볼 수 있었다.

빨간 단풍, 노란 은행잎들이 어우러진 풍경이 마치 그림 같았다. 자연의 아름다움 앞에서는 말이 필요 없는 것 같다.

등산로를 걸으며 맑은 공기를 마시니 몸과 마음이 모두 상쾌해졌다. 이런 시간들이 정말 소중하다.`,
    photos: ['autumn_leaves.jpg', 'mountain_view.jpg'],
    mood: 'great',
    weather: '맑음',
    tags: ['단풍', '등산', '내장산', '자연'],
    createdAt: '2024-11-15T18:20:00Z',
    updatedAt: '2024-11-15T18:35:00Z'
  }
]

// 날짜별로 일기가 있는지 확인하는 함수
export const hasDiaryForDate = (date: Date): boolean => {
  const dateString = date.toISOString().split('T')[0]
  return dummyDiaries.some(diary => diary.date === dateString)
}

// 특정 날짜의 일기를 가져오는 함수
export const getDiaryForDate = (date: Date): DiaryEntry | null => {
  const dateString = date.toISOString().split('T')[0]
  return dummyDiaries.find(diary => diary.date === dateString) || null
}

// 모든 일기를 날짜순으로 정렬해서 가져오는 함수
export const getAllDiaries = (): DiaryEntry[] => {
  return [...dummyDiaries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// 특정 기간의 일기들을 가져오는 함수
export const getDiariesInRange = (startDate: Date, endDate: Date): DiaryEntry[] => {
  const start = startDate.toISOString().split('T')[0]
  const end = endDate.toISOString().split('T')[0]
  
  return dummyDiaries.filter(diary => diary.date >= start && diary.date <= end)
}

// 검색 함수
export const searchDiaries = (query: string): DiaryEntry[] => {
  const lowerQuery = query.toLowerCase()
  return dummyDiaries.filter(diary => 
    diary.title.toLowerCase().includes(lowerQuery) ||
    diary.content.toLowerCase().includes(lowerQuery) ||
    diary.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
  )
}