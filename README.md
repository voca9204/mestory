# ME.STORY 📖

개인의 삶을 기록하고 관리하는 현대적인 디지털 다이어리 애플리케이션

## 🌟 주요 기능

- **2D 타임라인**: 수평(월일) × 수직(연도) 형태의 직관적인 시간축 네비게이션
- **스마트 일기 관리**: 텍스트, 사진, 위치 정보를 포함한 풍부한 콘텐츠 지원
- **고급 사진 시스템**: 모달 뷰어와 완벽한 키보드/마우스 네비게이션
- **Firebase 통합**: 실시간 데이터베이스, 인증, 클라우드 스토리지
- **반응형 디자인**: 모든 디바이스에서 최적화된 사용자 경험
- **Google OAuth**: 안전하고 편리한 로그인 시스템

## 🚀 기술 스택

### Frontend
- **React 18** + **TypeScript** - 현대적인 UI 라이브러리
- **Vite** - 빠른 개발 서버 및 빌드 도구
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **React Router Dom** - SPA 라우팅
- **Zustand** - 가벼운 상태 관리
- **Heroicons** - 아름다운 아이콘 세트

### Backend & Infrastructure
- **Firebase Firestore** - NoSQL 클라우드 데이터베이스
- **Firebase Auth** - 사용자 인증 관리
- **Firebase Storage** - 미디어 파일 저장
- **Firebase Functions** - 서버리스 백엔드 로직
- **Firebase Hosting** - 웹 애플리케이션 호스팅

### Development Tools
- **ESLint** - 코드 품질 관리
- **PostCSS** - CSS 후처리
- **date-fns** - 날짜 처리 라이브러리

## 📁 프로젝트 구조

```
mestory/
├── src/
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   ├── services/           # Firebase 및 외부 서비스 연동
│   ├── contexts/           # React Context (인증 등)
│   ├── data/               # 목 데이터 및 타입 정의
│   └── utils/              # 유틸리티 함수
├── docs/                   # 프로젝트 문서
├── scripts/               # 빌드 및 배포 스크립트
└── tasks/                 # 개발 작업 관리
```

## 🛠️ 설치 및 실행

### 필수 요구사항
- Node.js 16.0 이상
- npm 또는 yarn

### 설치
```bash
# 저장소 클론
git clone https://github.com/voca9204/mestory.git
cd mestory

# 의존성 설치
npm install
```

### 환경 설정
1. `.env.example`을 `.env`로 복사
2. Firebase 프로젝트 설정 정보 입력
```bash
cp .env.example .env
```

### 개발 서버 실행
```bash
npm run dev
```

## 📋 사용 가능한 스크립트

- `npm run dev` - 개발 서버 시작
- `npm run build` - 프로덕션 빌드
- `npm run preview` - 빌드된 앱 미리보기
- `npm run lint` - 코드 린팅
- `npm run firebase:deploy` - Firebase 배포
- `npm run db:indexes:deploy` - Firestore 인덱스 배포

## 🔧 데이터베이스 구조

프로젝트는 확장 가능한 Firestore 데이터 모델을 사용합니다:

- **시간 기반 컬렉션 분할**: 연도별/월별 데이터 분리로 성능 최적화
- **샤딩 전략**: 대용량 데이터 처리를 위한 분산 저장
- **관계 매핑**: 엔티티 간 연결 관계 시스템
- **자동 콘텐츠 분할**: 대용량 일기 자동 분할/병합

자세한 내용은 [`docs/firestore-data-model.md`](docs/firestore-data-model.md)를 참조하세요.

## 🎯 주요 컴포넌트

### Timeline2D
2차원 타임라인 인터페이스로 직관적인 시간 네비게이션을 제공합니다.

### DiaryEditor
풍부한 텍스트 편집과 멀티미디어 콘텐츠 지원을 위한 일기 편집기입니다.

### PhotoUpload
드래그 앤 드롭과 클립보드 붙여넣기를 지원하는 사진 업로드 시스템입니다.

## 🚀 배포

### Firebase 배포
```bash
# Firebase 로그인
npm run firebase:login

# 프로젝트 빌드 및 배포
npm run build
npm run firebase:deploy
```

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 개인 프로젝트로 제작되었습니다.

## 📞 연락처

프로젝트 관련 문의: [GitHub Issues](https://github.com/voca9204/mestory/issues)

---

**ME.STORY**는 개인의 소중한 순간들을 디지털로 보존하고 아름답게 시각화하는 것을 목표로 합니다. 💫