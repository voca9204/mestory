import { ContextData } from './mockTypes'

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