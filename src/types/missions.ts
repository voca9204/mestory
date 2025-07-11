export enum MissionType {
  DECLUTTER = 'declutter',     // 버리기 미션
  TODO = 'todo',               // 하기 미션  
  READING = 'reading',         // 독서 미션
  KNOWLEDGE = 'knowledge',     // 상식 미션
  ENGLISH = 'english',         // 영어단어 미션
  LANGUAGE = 'language',       // 외국어 한마디 미션
  EXERCISE = 'exercise',       // 운동 미션
  GRATITUDE = 'gratitude',     // 감사 일기 미션
  MEDITATION = 'meditation',   // 명상 미션
  COOKING = 'cooking',         // 요리 미션
  KINDNESS = 'kindness',       // 친절 미션
  CREATIVE = 'creative',       // 창작 미션
  HEALTH = 'health',          // 건강 습관 미션
  SAVING = 'saving',          // 절약 미션
  ECO = 'eco',                // 환경보호 미션
  MIXED = 'mixed'             // 종합 미션
}

export interface MissionTypeInfo {
  type: MissionType
  name: string
  description: string
  icon: string
  color: string
}

export interface Mission {
  id: string
  type: MissionType
  startDate: string
  duration: number
  completedDays: string[]
  isActive: boolean
  userId: string
  createdAt: Date
  updatedAt: Date
  selectedMissionTypes?: MissionType[]
}

export interface MissionProgress {
  missionId: string
  date: string
  completed: boolean
  note?: string
  itemsCompleted?: number
}

export const MISSION_TYPE_INFO: Record<MissionType, MissionTypeInfo> = {
  [MissionType.DECLUTTER]: {
    type: MissionType.DECLUTTER,
    name: '미니멀 라이프',
    description: '매일 물건을 정리하며 단순한 삶 추구',
    icon: '🗑️',
    color: 'from-blue-500 to-indigo-600'
  },
  [MissionType.TODO]: {
    type: MissionType.TODO,
    name: '하루 한 가지',
    description: '매일 하나씩 미뤄둔 일 해치우기',
    icon: '✅',
    color: 'from-green-500 to-emerald-600'
  },
  [MissionType.READING]: {
    type: MissionType.READING,
    name: '독서 습관',
    description: '매일 조금씩 책 읽기',
    icon: '📚',
    color: 'from-purple-500 to-pink-600'
  },
  [MissionType.KNOWLEDGE]: {
    type: MissionType.KNOWLEDGE,
    name: '상식 쌓기',
    description: '매일 새로운 지식 하나씩',
    icon: '🧠',
    color: 'from-yellow-500 to-orange-600'
  },
  [MissionType.ENGLISH]: {
    type: MissionType.ENGLISH,
    name: '영어 단어',
    description: '매일 영어 단어 암기',
    icon: '🔤',
    color: 'from-cyan-500 to-blue-600'
  },
  [MissionType.LANGUAGE]: {
    type: MissionType.LANGUAGE,
    name: '외국어 한마디',
    description: '매일 새로운 외국어 표현 학습',
    icon: '🌍',
    color: 'from-teal-500 to-green-600'
  },
  [MissionType.EXERCISE]: {
    type: MissionType.EXERCISE,
    name: '운동 루틴',
    description: '매일 운동으로 건강한 몸 만들기',
    icon: '💪',
    color: 'from-red-500 to-pink-600'
  },
  [MissionType.GRATITUDE]: {
    type: MissionType.GRATITUDE,
    name: '감사 일기',
    description: '매일 감사한 일 기록하기',
    icon: '🙏',
    color: 'from-pink-500 to-rose-600'
  },
  [MissionType.MEDITATION]: {
    type: MissionType.MEDITATION,
    name: '명상/마음챙김',
    description: '매일 마음의 평화 찾기',
    icon: '🧘',
    color: 'from-indigo-500 to-purple-600'
  },
  [MissionType.COOKING]: {
    type: MissionType.COOKING,
    name: '요리 도전',
    description: '매일 새로운 요리 시도하기',
    icon: '👨‍🍳',
    color: 'from-orange-500 to-red-600'
  },
  [MissionType.KINDNESS]: {
    type: MissionType.KINDNESS,
    name: '친절 실천',
    description: '매일 작은 친절 베풀기',
    icon: '💝',
    color: 'from-rose-500 to-pink-600'
  },
  [MissionType.CREATIVE]: {
    type: MissionType.CREATIVE,
    name: '창작 활동',
    description: '매일 그림, 글쓰기 등 창작하기',
    icon: '🎨',
    color: 'from-violet-500 to-purple-600'
  },
  [MissionType.HEALTH]: {
    type: MissionType.HEALTH,
    name: '건강 습관',
    description: '매일 건강한 습관 만들기',
    icon: '🏥',
    color: 'from-emerald-500 to-teal-600'
  },
  [MissionType.SAVING]: {
    type: MissionType.SAVING,
    name: '절약 챌린지',
    description: '매일 돈 아끼는 방법 실천',
    icon: '💰',
    color: 'from-amber-500 to-yellow-600'
  },
  [MissionType.ECO]: {
    type: MissionType.ECO,
    name: '환경 보호',
    description: '매일 지구를 위한 작은 실천',
    icon: '🌱',
    color: 'from-green-600 to-emerald-700'
  },
  [MissionType.MIXED]: {
    type: MissionType.MIXED,
    name: '종합 미션',
    description: '선택한 미션들을 섞어서 매일 다양한 도전',
    icon: '🎭',
    color: 'from-purple-500 to-pink-600'
  }
}