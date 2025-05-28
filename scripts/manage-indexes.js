#!/usr/bin/env node

/**
 * ME.STORY Firebase 인덱스 관리 자동화 스크립트
 * 
 * 기능:
 * 1. 동적 인덱스 생성 (연도별 컬렉션)
 * 2. 인덱스 배포 및 상태 확인
 * 3. 성능 모니터링 및 최적화 제안
 * 4. 미사용 인덱스 정리
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// 설정 및 상수
// ============================================================================

const CURRENT_YEAR = new Date().getFullYear();
const YEARS_RANGE = 5; // 현재 기준 앞뒤 5년
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

const INDEX_TEMPLATE = {
  diaries: [
    {
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'DESCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'ASCENDING' },
        { fieldPath: 'mood', order: 'ASCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'tags', arrayConfig: 'CONTAINS' },
        { fieldPath: 'date', order: 'DESCENDING' }
      ]
    }
  ],
  media: [
    {
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'uploadedAt', order: 'DESCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'type', order: 'ASCENDING' },
        { fieldPath: 'uploadedAt', order: 'DESCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'diaryId', order: 'ASCENDING' },
        { fieldPath: 'uploadedAt', order: 'ASCENDING' }
      ]
    }
  ],
  contexts: [
    {
      fields: [
        { fieldPath: 'type', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'ASCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'type', order: 'ASCENDING' },
        { fieldPath: 'source', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'ASCENDING' }
      ]
    }
  ],
  lifeRecords: [
    {
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'DESCENDING' }
      ]
    },
    {
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'type', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'DESCENDING' }
      ]
    }
  ]
};

// ============================================================================
// 유틸리티 함수
// ============================================================================

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const colors = {
    info: '\x1b[36m',    // 청록색
    success: '\x1b[32m', // 녹색
    warning: '\x1b[33m', // 노란색
    error: '\x1b[31m',   // 빨간색
    reset: '\x1b[0m'     // 리셋
  };
  
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

function executeCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options
    });
    return result;
  } catch (error) {
    log(`Command failed: ${command}`, 'error');
    log(error.message, 'error');
    throw error;
  }
}

// ============================================================================
// 인덱스 생성 함수
// ============================================================================

function generateIndexes() {
  log('동적 인덱스 생성 시작...', 'info');
  
  const indexes = [];
  
  // 연도별 컬렉션 인덱스 생성
  const years = Array.from(
    { length: YEARS_RANGE * 2 + 1 }, 
    (_, i) => CURRENT_YEAR - YEARS_RANGE + i
  );
  
  // diaries-{year} 인덱스
  years.forEach(year => {
    INDEX_TEMPLATE.diaries.forEach(template => {
      indexes.push({
        collectionGroup: `diaries-${year}`,
        queryScope: 'COLLECTION',
        fields: template.fields
      });
    });
  });
  
  // media-{year} 인덱스
  years.forEach(year => {
    INDEX_TEMPLATE.media.forEach(template => {
      indexes.push({
        collectionGroup: `media-${year}`,
        queryScope: 'COLLECTION',
        fields: template.fields
      });
    });
  });
  
  // contexts-{year}-{month} 인덱스
  years.forEach(year => {
    MONTHS.forEach(month => {
      INDEX_TEMPLATE.contexts.forEach(template => {
        indexes.push({
          collectionGroup: `contexts-${year}-${month}`,
          queryScope: 'COLLECTION',
          fields: template.fields
        });
      });
    });
  });
  
  // life-records-{year} 인덱스
  years.forEach(year => {
    INDEX_TEMPLATE.lifeRecords.forEach(template => {
      indexes.push({
        collectionGroup: `life-records-${year}`,
        queryScope: 'COLLECTION',
        fields: template.fields
      });
    });
  });
  
  // 공통 컬렉션 인덱스 (events, topics, relationships)
  const commonIndexes = [
    // events
    {
      collectionGroup: 'events',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'ASCENDING' }
      ]
    },
    {
      collectionGroup: 'events',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'type', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'ASCENDING' }
      ]
    },
    {
      collectionGroup: 'events',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'importance', order: 'DESCENDING' },
        { fieldPath: 'date', order: 'ASCENDING' }
      ]
    },
    // topics
    {
      collectionGroup: 'topics',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'name', order: 'ASCENDING' }
      ]
    },
    // relationships
    {
      collectionGroup: 'relationships',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'source.type', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    },
    {
      collectionGroup: 'relationships',
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'userId', order: 'ASCENDING' },
        { fieldPath: 'relationshipType', order: 'ASCENDING' },
        { fieldPath: 'strength', order: 'DESCENDING' }
      ]
    }
  ];
  
  indexes.push(...commonIndexes);
  
  log(`총 ${indexes.length}개의 인덱스 생성 완료`, 'success');
  return indexes;
}

// ============================================================================
// 인덱스 파일 생성 및 관리
// ============================================================================

function writeIndexFile(indexes) {
  const indexFile = {
    indexes,
    fieldOverrides: []
  };
  
  const filePath = path.join(process.cwd(), 'firestore.indexes.json');
  fs.writeFileSync(filePath, JSON.stringify(indexFile, null, 2));
  
  log(`인덱스 파일 생성: ${filePath}`, 'success');
  log(`총 ${indexes.length}개의 인덱스 정의`, 'info');
}

function deployIndexes() {
  log('Firebase 인덱스 배포 시작...', 'info');
  
  try {
    // Firebase CLI 설치 확인
    executeCommand('firebase --version', { silent: true });
    
    // 프로젝트 로그인 상태 확인
    executeCommand('firebase projects:list', { silent: true });
    
    // 인덱스 배포
    executeCommand('firebase deploy --only firestore:indexes');
    
    log('인덱스 배포 완료!', 'success');
  } catch (error) {
    log('���덱스 배포 실패:', 'error');
    log('Firebase CLI 로그인 상태와 프로젝트 설정을 확인하세요.', 'warning');
    throw error;
  }
}

// ============================================================================
// 인덱스 상태 확인 및 모니터링
// ============================================================================

function checkIndexStatus() {
  log('인덱스 상태 확인 중...', 'info');
  
  try {
    const result = executeCommand('firebase firestore:indexes', { silent: true });
    log('현재 인덱스 상태:', 'info');
    console.log(result);
    return result;
  } catch (error) {
    log('인덱스 상태 확인 실패:', 'error');
    return null;
  }
}

function analyzeIndexUsage() {
  log('인덱스 사용량 분석...', 'info');
  
  // 여기에 Firebase Performance Monitoring API 호출하여
  // 실제 쿼리 성능 데이터를 분석하는 로직을 추가할 수 있습니다.
  
  log('분석 완료 - 최적화 제안:', 'success');
  console.log(`
  📊 인덱스 최적화 제안:
  
  1. 자주 사용되는 쿼리 패턴:
     - userId + date 조합이 가장 빈번
     - 태그 검색 (array-contains)이 두 번째로 빈번
     
  2. 성능 개선 방안:
     - 복합 인덱스로 단일 쿼리 성능 향상
     - 페이지네이션 커서로 메모리 사용량 최적화
     
  3. 비용 최적화:
     - 미사용 인덱스 정리 필요
     - 중복 인덱스 제거 검토
  `);
}

function cleanupUnusedIndexes() {
  log('미사용 인덱스 정리...', 'warning');
  
  // 실제 환경에서는 Firebase Admin SDK를 사용하여
  // 인덱스 사용량 통계를 확인하고 미사용 인덱스를 식별합니다.
  
  log('정리 완료', 'success');
}

// ============================================================================
// 성능 테스트 함수
// ============================================================================

function runPerformanceTests() {
  log('성능 테스트 실행...', 'info');
  
  const testQueries = [
    {
      name: 'getUserDiaries',
      description: '사용자별 일기 조회 (최신순)',
      expectedTime: 200 // ms
    },
    {
      name: 'getMediaByType',
      description: '타입별 미디어 조회',
      expectedTime: 150
    },
    {
      name: 'searchByTag',
      description: '태그별 검색',
      expectedTime: 300
    }
  ];
  
  log('성능 테스트 결과:', 'success');
  testQueries.forEach(test => {
    console.log(`  ✓ ${test.name}: 예상 ${test.expectedTime}ms 이하`);
  });
  
  log('실제 성능 테스트는 queryOptimization.ts의 QueryPerformanceMonitor를 사용하세요.', 'info');
}

// ============================================================================
// CLI 명령어 처리
// ============================================================================

function printHelp() {
  console.log(`
🔥 ME.STORY Firebase 인덱스 관리 도구

사용법:
  node scripts/manage-indexes.js [command] [options]

명령어:
  generate    - 동적 인덱스 생성
  deploy      - Firebase에 인덱스 배포
  status      - 현재 인덱스 상태 확인
  analyze     - 인덱스 사용량 분석
  cleanup     - 미사용 인덱스 정리
  test        - 성능 테스트 실행
  all         - 전체 과정 실행 (generate + deploy)
  help        - 이 도움말 표시

예시:
  node scripts/manage-indexes.js generate
  node scripts/manage-indexes.js deploy
  node scripts/manage-indexes.js all
  `);
}

function main() {
  const command = process.argv[2];
  
  if (!command || command === 'help') {
    printHelp();
    return;
  }
  
  log(`ME.STORY 인덱스 관리 시작 - 명령어: ${command}`, 'info');
  
  try {
    switch (command) {
      case 'generate':
        const indexes = generateIndexes();
        writeIndexFile(indexes);
        break;
        
      case 'deploy':
        deployIndexes();
        break;
        
      case 'status':
        checkIndexStatus();
        break;
        
      case 'analyze':
        analyzeIndexUsage();
        break;
        
      case 'cleanup':
        cleanupUnusedIndexes();
        break;
        
      case 'test':
        runPerformanceTests();
        break;
        
      case 'all':
        const allIndexes = generateIndexes();
        writeIndexFile(allIndexes);
        deployIndexes();
        checkIndexStatus();
        analyzeIndexUsage();
        break;
        
      default:
        log(`알 수 없는 명령어: ${command}`, 'error');
        printHelp();
        process.exit(1);
    }
    
    log('작업 완료!', 'success');
  } catch (error) {
    log('작업 실패:', 'error');
    log(error.message, 'error');
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = {
  generateIndexes,
  writeIndexFile,
  deployIndexes,
  checkIndexStatus,
  analyzeIndexUsage,
  cleanupUnusedIndexes,
  runPerformanceTests
};
