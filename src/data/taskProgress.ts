// Task 진행 상황 데이터
export interface TaskStatus {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  progress: number;
  phase: string;
  completedDate?: string;
  subtasks?: {
    id: string;
    title: string;
    status: 'completed' | 'in-progress' | 'pending';
  }[];
}

export const taskProgress: TaskStatus[] = [
  {
    id: 1,
    title: "프로젝트 초기 설정 및 아키텍처 구성",
    description: "Vite + React + TypeScript 기반 웹 애플리케이션 설정",
    status: "completed",
    progress: 100,
    phase: "Phase 1: MVP 핵심 기능",
    completedDate: "2025-05-25"
  },
  {
    id: 2,
    title: "백엔드 인프라 및 데이터베이스 설계",
    description: "Firebase 연동 및 Firestore 데이터 모델 최적화",
    status: "in-progress",
    progress: 50,
    phase: "Phase 1: MVP 핵심 기능",
    subtasks: [
      { id: "2.1", title: "Firestore 데이터 모델 최적화", status: "completed" },
      { id: "2.2", title: "쿼리 최적화 및 인덱싱 전략", status: "completed" },
      { id: "2.3", title: "미디어 저장소 및 처리 파이프라인", status: "pending" },
      { id: "2.4", title: "사용자 인증 시스템 구현", status: "pending" },
    ]
  },
  {
    id: 3,
    title: "사용자 인증 및 계정 관리 시스템 구현",
    description: "Firebase Authentication, Google 로그인 연동, 프로필 관리",
    status: "completed",
    progress: 100,
    phase: "Phase 1: MVP 핵심 기능",
    completedDate: "2025-05-25"
  },
  {
    id: 4,
    title: "기본 일기 작성 및 조회 기능 개발",
    description: "실제 Firebase 데이터 저장/불러오기, CRUD 기능",
    status: "completed",
    progress: 100,
    phase: "Phase 1: MVP 핵심 기능",
    completedDate: "2025-05-25"
  },
  {
    id: 5,
    title: "사진 업로드 및 관리 기능 구현",
    description: "Firebase Storage 연동, 이미지 업로드/갤러리",
    status: "completed",
    progress: 100,
    phase: "Phase 1: MVP 핵심 기능",
    completedDate: "2025-05-25"
  },
  {
    id: 6,
    title: "2D 달력 내비게이션 시스템 개발",
    description: "수평(월일) × 수직(연도) 2D 타임라인",
    status: "completed",
    progress: 100,
    phase: "Phase 1: MVP 핵심 기능",
    completedDate: "2025-05-25"
  },
  {
    id: 7,
    title: "날짜별 상세 뷰 개발",
    description: "선택된 날짜의 모든 기록 레이어 통합 뷰",
    status: "completed",
    progress: 100,
    phase: "Phase 1: MVP 핵심 기능",
    completedDate: "2025-05-25"
  },
  {
    id: 8,
    title: "기본 검색 기능 구현",
    description: "전체 일기 내용 검색, 날짜 범위 필터링",
    status: "pending",
    progress: 0,
    phase: "Phase 1: MVP 핵심 기능"
  },
  {
    id: 9,
    title: "SNS 데이터 수집 시스템 개발",
    description: "Instagram, Twitter API 연동, 소셜 미디어 포스트 수집",
    status: "pending",
    progress: 0,
    phase: "Phase 2: 데이터 연동"
  },
  {
    id: 10,
    title: "날씨 및 뉴스 API 연동 구현",
    description: "기상청 API, 뉴스 API 연동으로 맥락 정보 수집",
    status: "pending",
    progress: 0,
    phase: "Phase 2: 데이터 연동"
  },
  {
    id: 23,
    title: "2D 타임라인 '오늘' 버튼 중앙 정렬 버그 수정",
    description: "디폴트 화면 위치 개선, 년도 표시 UI 개선",
    status: "completed",
    progress: 100,
    phase: "버그 수정",
    completedDate: "2025-05-25"
  },
  {
    id: 24,
    title: "고급 사진 시스템 개발 및 통합",
    description: "3D 공간 시간 여행, AI 기반 추억 큐레이션",
    status: "pending",
    progress: 0,
    phase: "Phase 4: 미래 기능"
  }
];

// 프로젝트 통계
export const projectStats = {
  totalTasks: 24,
  completedTasks: 7,
  inProgressTasks: 1,
  pendingTasks: 16,
  overallProgress: 42, // 약 42%
  phases: [
    {
      name: "Phase 1: MVP 핵심 기능",
      tasks: 8,
      completed: 7,
      progress: 88
    },
    {
      name: "Phase 2: 데이터 연동",
      tasks: 4,
      completed: 0,
      progress: 0
    },
    {
      name: "Phase 3: 고급 기능",
      tasks: 7,
      completed: 0,
      progress: 0
    },
    {
      name: "Phase 4: 인프라/배포",
      tasks: 3,
      completed: 0,
      progress: 0
    }
  ]
};
