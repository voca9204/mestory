# Firebase Storage 구조 설계

## 폴더 구조

```
/users/{userId}/
├── media/
│   ├── originals/
│   │   ├── 2025/
│   │   │   ├── 01/
│   │   │   ├── 02/
│   │   │   └── ...
│   │   └── 2024/
│   │       └── ...
│   ├── thumbnails/
│   │   ├── small/    # 150x150
│   │   ├── medium/   # 400x400
│   │   └── large/    # 800x800
│   └── compressed/
│       ├── webp/     # WebP 변환본
│       └── jpeg/     # 최적화된 JPEG
├── exports/
│   └── data-backup-{timestamp}.json
└── temp/
    └── uploads/      # 임시 업로드 저장소
```

## 보안 규칙

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // 사용자별 미디어 파일 접근 제어
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 임시 업로드 폴더 (24시간 후 자동 삭제)
    match /temp/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 메타데이터 스키마

```typescript
interface MediaMetadata {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  uploadedAt: Date;
  uploadedBy: string;
  storagePath: string;
  thumbnails: {
    small: string;
    medium: string;
    large: string;
  };
  compressed: {
    webp?: string;
    jpeg?: string;
  };
  exifData?: {
    dateTaken?: Date;
    location?: {
      latitude: number;
      longitude: number;
    };
    camera?: string;
    settings?: {
      iso?: number;
      aperture?: string;
      shutterSpeed?: string;
    };
  };
  associations: {
    diaryIds: string[];
    tags: string[];
  };
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  versions: {
    original: string;
    thumbnail: string;
    compressed: string;
  };
}
```

## 처리 파이프라인

### 1. 업로드 단계
1. 클라이언트에서 파일 선택
2. 파일 검증 (크기, 형식, 권한)
3. 임시 저장소에 업로드
4. 업로드 진행률 표시
5. 업로드 완료 시 Cloud Function 트리거

### 2. 처리 단계 (Cloud Functions)
1. EXIF 데이터 추출
2. 이미지 리사이징 (3가지 썸네일 크기)
3. 포맷 변환 (WebP, 최적화된 JPEG)
4. 메타데이터 Firestore에 저장
5. 원본을 영구 저장소로 이동
6. 임시 파일 정리

### 3. 최적화 전략
- **점진적 로딩**: 썸네일 → 중간 → 원본 순서
- **CDN 활용**: Firebase Storage의 자동 CDN
- **캐싱**: 브라우저 캐시 + Service Worker
- **압축**: 자동 WebP 변환으로 용량 절약

## 구현 우선순위

### Phase 1: 기본 업로드
- [ ] 기본 파일 업로드 인터페이스
- [ ] Firebase Storage 연동
- [ ] 진행률 표시
- [ ] 에러 처리

### Phase 2: 이미지 처리
- [ ] Cloud Functions 구현
- [ ] 썸네일 생성
- [ ] EXIF 데이터 추출
- [ ] 메타데이터 저장

### Phase 3: 최적화
- [ ] WebP 변환
- [ ] 점진적 로딩
- [ ] 캐싱 전략
- [ ] 성능 모니터링
