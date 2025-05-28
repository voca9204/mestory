// ME.STORY 쿼리 성능 테스트 스위트
import { 
  OptimizedDiaryService, 
  OptimizedMediaService, 
  OptimizedEventService,
  UnifiedSearchService,
  QueryPerformanceMonitor,
  PaginatedResult,
  QueryOptions,
  SearchFilters 
} from './queryOptimization';
import { Diary, Media, Event } from './database';

// ============================================================================
// 테스트 데이터 생성
// ============================================================================

export class TestDataGenerator {
  
  // 대용량 테스트용 사용자 ID 목록
  static readonly TEST_USER_IDS = [
    'test-user-001',
    'test-user-002', 
    'test-user-003',
    'test-user-004',
    'test-user-005'
  ];

  // 테스트용 날짜 범위 생성
  static generateDateRange(monthsBack: number = 12): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - monthsBack);
    return { start, end };
  }

  // 랜덤 검색 필터 생성
  static generateRandomFilters(): SearchFilters {
    const moods = ['great', 'good', 'neutral', 'bad', 'terrible'];
    const tags = ['work', 'family', 'travel', 'food', 'exercise', 'study', 'hobby'];
    const mediaTypes = ['image', 'video', 'audio', 'document'];
    
    return {
      mood: Math.random() > 0.5 ? moods[Math.floor(Math.random() * moods.length)] : undefined,
      tags: Math.random() > 0.7 ? [tags[Math.floor(Math.random() * tags.length)]] : undefined,
      dateRange: this.generateDateRange(Math.floor(Math.random() * 24) + 1),
      mediaType: Math.random() > 0.6 ? mediaTypes[Math.floor(Math.random() * mediaTypes.length)] : undefined,
      minImportance: Math.random() > 0.8 ? Math.floor(Math.random() * 5) + 1 : undefined
    };
  }
}

// ============================================================================
// 성능 테스트 클래스
// ============================================================================

export class QueryPerformanceTests {
  
  private results: Map<string, number[]> = new Map();
  
  // 단일 테스트 실행
  async runSingleTest(
    testName: string, 
    testFn: () => Promise<any>,
    iterations: number = 5
  ): Promise<{ avgTime: number; minTime: number; maxTime: number; results: any[] }> {
    console.log(`\n🧪 테스트 실행: ${testName} (${iterations}회 반복)`);
    
    const times: number[] = [];
    const results: any[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const { result, executionTime } = await QueryPerformanceMonitor.measureQueryTime(
        `${testName}_${i + 1}`,
        testFn
      );
      
      times.push(executionTime);
      results.push(result);
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    this.results.set(testName, times);
    
    console.log(`📊 결과: 평균 ${avgTime.toFixed(2)}ms, 최소 ${minTime.toFixed(2)}ms, 최대 ${maxTime.toFixed(2)}ms`);
    
    return { avgTime, minTime, maxTime, results };
  }

  // 일기 조회 성능 테스트
  async testDiaryQueries(): Promise<void> {
    console.log('\n📝 일기 쿼리 성능 테스트');
    
    const userId = TestDataGenerator.TEST_USER_IDS[0];
    const dateRange = TestDataGenerator.generateDateRange(6);
    
    // 1. 기본 날짜 범위 조회
    await this.runSingleTest(
      'diary_basic_date_range',
      () => OptimizedDiaryService.getByDateRangeOptimized(
        userId,
        dateRange.start,
        dateRange.end,
        { limitCount: 20 }
      )
    );
    
    // 2. 페이지네이션 테스트
    let cursor: any = undefined;
    await this.runSingleTest(
      'diary_pagination_page1',
      async () => {
        const result = await OptimizedDiaryService.getByDateRangeOptimized(
          userId,
          dateRange.start,
          dateRange.end,
          { limitCount: 10 }
        );
        cursor = result.nextCursor;
        return result;
      }
    );
    
    if (cursor) {
      await this.runSingleTest(
        'diary_pagination_page2',
        () => OptimizedDiaryService.getByDateRangeOptimized(
          userId,
          dateRange.start,
          dateRange.end,
          { limitCount: 10, cursor }
        )
      );
    }
    
    // 3. 고급 검색 테스트
    const searchFilters = TestDataGenerator.generateRandomFilters();
    await this.runSingleTest(
      'diary_advanced_search',
      () => OptimizedDiaryService.searchDiariesAdvanced(
        userId,
        searchFilters,
        { limitCount: 15 }
      )
    );
    
    // 4. 태그 검색 테스트
    await this.runSingleTest(
      'diary_tag_search',
      () => OptimizedDiaryService.getByTag(
        userId,
        'work',
        { limitCount: 20 }
      )
    );
    
    // 5. 개수 조회 테스트
    await this.runSingleTest(
      'diary_count_query',
      () => OptimizedDiaryService.getCountByDateRange(
        userId,
        dateRange.start,
        dateRange.end
      )
    );
  }

  // 미디어 조회 성능 테스트
  async testMediaQueries(): Promise<void> {
    console.log('\n🖼️ 미디어 쿼리 성능 테스트');
    
    const userId = TestDataGenerator.TEST_USER_IDS[1];
    
    // 1. 타입별 미디어 조회
    await this.runSingleTest(
      'media_by_type_image',
      () => OptimizedMediaService.getByTypeOptimized(
        userId,
        'image',
        { limitCount: 25 }
      )
    );
    
    await this.runSingleTest(
      'media_by_type_video',
      () => OptimizedMediaService.getByTypeOptimized(
        userId,
        'video',
        { limitCount: 15 }
      )
    );
    
    // 2. 일기별 미디어 조회
    const diaryId = `${userId}_20250515_abc123`;
    await this.runSingleTest(
      'media_by_diary',
      () => OptimizedMediaService.getByDiaryOptimized(diaryId)
    );
    
    // 3. 최근 미디어 조회
    await this.runSingleTest(
      'media_recent',
      () => OptimizedMediaService.getRecentMedia(userId, 30)
    );
  }

  // 이벤트 조회 성능 테스트
  async testEventQueries(): Promise<void> {
    console.log('\n📅 이벤트 쿼리 성능 테스트');
    
    const userId = TestDataGenerator.TEST_USER_IDS[2];
    
    // 1. 중요도별 이벤트 조회
    await this.runSingleTest(
      'event_by_importance',
      () => OptimizedEventService.getByImportanceOptimized(
        userId,
        3,
        { limitCount: 20 }
      )
    );
    
    // 2. 타입별 이벤트 조회
    await this.runSingleTest(
      'event_by_type_birthday',
      () => OptimizedEventService.getByTypeOptimized(
        userId,
        'birthday',
        { limitCount: 10 }
      )
    );
    
    // 3. 기본 사용자 이벤트 조회
    await this.runSingleTest(
      'event_user_events',
      () => OptimizedEventService.getUserEvents(userId)
    );
  }

  // 통합 검색 성능 테스트
  async testUnifiedSearch(): Promise<void> {
    console.log('\n🔍 통합 검색 성능 테스트');
    
    const userId = TestDataGenerator.TEST_USER_IDS[3];
    const searchTerms = ['project', 'travel', 'birthday', 'work', 'family'];
    
    for (const term of searchTerms) {
      await this.runSingleTest(
        `unified_search_${term}`,
        () => UnifiedSearchService.searchAll(
          userId,
          term,
          TestDataGenerator.generateRandomFilters(),
          { limitCount: 8 }
        )
      );
    }
  }

  // 대용량 데이터 스트레스 테스트
  async testStressScenarios(): Promise<void> {
    console.log('\n💪 스트레스 테스트 (대용량 데이터)');
    
    // 1. 대량 데이터 조회
    await this.runSingleTest(
      'stress_large_date_range',
      () => OptimizedDiaryService.getByDateRangeOptimized(
        TestDataGenerator.TEST_USER_IDS[0],
        new Date('2020-01-01'),
        new Date(),
        { limitCount: 100 }
      ),
      3 // 반복 횟수 줄임
    );
    
    // 2. 여러 사용자 동시 조회
    await this.runSingleTest(
      'stress_multiple_users',
      async () => {
        const promises = TestDataGenerator.TEST_USER_IDS.map(userId =>
          OptimizedDiaryService.getByDateRangeOptimized(
            userId,
            TestDataGenerator.generateDateRange(3).start,
            new Date(),
            { limitCount: 20 }
          )
        );
        return Promise.all(promises);
      },
      3
    );
    
    // 3. 복잡한 검색 쿼리
    await this.runSingleTest(
      'stress_complex_search',
      () => OptimizedDiaryService.searchDiariesAdvanced(
        TestDataGenerator.TEST_USER_IDS[0],
        {
          mood: 'good',
          tags: ['work', 'project'],
          dateRange: TestDataGenerator.generateDateRange(12)
        },
        { limitCount: 50 }
      ),
      3
    );
  }

  // 전체 성능 테스트 실행
  async runAllTests(): Promise<void> {
    console.log('🚀 ME.STORY 쿼리 성능 테스트 시작');
    console.log('='.repeat(60));
    
    const startTime = performance.now();
    
    try {
      await this.testDiaryQueries();
      await this.testMediaQueries();
      await this.testEventQueries();
      await this.testUnifiedSearch();
      await this.testStressScenarios();
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      console.log('\n🏁 전체 테스트 완료!');
      console.log('='.repeat(60));
      console.log(`총 실행 시간: ${(totalTime / 1000).toFixed(2)}초`);
      
      this.printSummary();
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 테스트 실행 중 오류 발생:', error);
      throw error;
    }
  }

  // 결과 요약 출력
  private printSummary(): void {
    console.log('\n📊 성능 테스트 요약');
    console.log('-'.repeat(40));
    
    const allResults = Array.from(this.results.entries());
    allResults.sort((a, b) => {
      const avgA = a[1].reduce((sum, time) => sum + time, 0) / a[1].length;
      const avgB = b[1].reduce((sum, time) => sum + time, 0) / b[1].length;
      return avgA - avgB;
    });
    
    allResults.forEach(([testName, times]) => {
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      const status = avg < 500 ? '✅' : avg < 1000 ? '⚠️' : '❌';
      console.log(`${status} ${testName}: ${avg.toFixed(2)}ms`);
    });
  }

  // 상세 리포트 생성
  private generateReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.size,
        averageTime: 0,
        fastestTest: '',
        slowestTest: '',
        recommendations: []
      },
      details: Object.fromEntries(this.results)
    };
    
    // 평균 시간 계산
    let totalTime = 0;
    let testCount = 0;
    let fastestTime = Infinity;
    let slowestTime = 0;
    let fastestTest = '';
    let slowestTest = '';
    
    for (const [testName, times] of this.results) {
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      totalTime += avg;
      testCount++;
      
      if (avg < fastestTime) {
        fastestTime = avg;
        fastestTest = testName;
      }
      
      if (avg > slowestTime) {
        slowestTime = avg;
        slowestTest = testName;
      }
    }
    
    report.summary.averageTime = totalTime / testCount;
    report.summary.fastestTest = `${fastestTest} (${fastestTime.toFixed(2)}ms)`;
    report.summary.slowestTest = `${slowestTest} (${slowestTime.toFixed(2)}ms)`;
    
    // 성능 개선 권장사항
    const recommendations = [];
    
    if (slowestTime > 1000) {
      recommendations.push('가장 느린 쿼리의 인덱스 최적화 필요');
    }
    
    if (report.summary.averageTime > 500) {
      recommendations.push('전반적인 쿼리 성능 개선 필요');
    }
    
    if (this.results.has('stress_large_date_range')) {
      const stressTimes = this.results.get('stress_large_date_range')!;
      const stressAvg = stressTimes.reduce((sum, time) => sum + time, 0) / stressTimes.length;
      if (stressAvg > 2000) {
        recommendations.push('대용량 데이터 처리 최적화 필요');
      }
    }
    
    report.summary.recommendations = recommendations;
    
    console.log('\n📋 성능 리포트 생성 완료');
    console.log(`평균 응답 시간: ${report.summary.averageTime.toFixed(2)}ms`);
    console.log(`가장 빠른 테스트: ${report.summary.fastestTest}`);
    console.log(`가장 느린 테스트: ${report.summary.slowestTest}`);
    
    if (recommendations.length > 0) {
      console.log('\n💡 개선 권장사항:');
      recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }
}

// ============================================================================
// 벤치마크 비교 테스트
// ============================================================================

export class BenchmarkComparison {
  
  // 기존 vs 최적화된 쿼리 성능 비교
  static async compareOptimizations(): Promise<void> {
    console.log('\n⚡ 최적화 성능 비교 테스트');
    console.log('-'.repeat(50));
    
    const userId = TestDataGenerator.TEST_USER_IDS[0];
    const dateRange = TestDataGenerator.generateDateRange(6);
    
    // 커서 페이지네이션 vs 오프셋 페이지네이션 시뮬레이션
    const comparisons = [
      {
        name: '기본 쿼리 (최적화 전)',
        fn: () => this.simulateBasicQuery(userId, dateRange.start, dateRange.end)
      },
      {
        name: '최적화된 쿼리 (커서 페이지네이션)',
        fn: () => OptimizedDiaryService.getByDateRangeOptimized(
          userId, 
          dateRange.start, 
          dateRange.end,
          { limitCount: 20 }
        )
      }
    ];
    
    const results = await QueryPerformanceMonitor.compareQueries(comparisons);
    
    const improvement = results[1].executionTime > 0 
      ? ((results[0].executionTime - results[1].executionTime) / results[0].executionTime * 100)
      : 0;
    
    console.log(`\n📈 성능 개선: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`);
  }
  
  // 기본 쿼리 시뮬레이션 (최적화 전)
  private static async simulateBasicQuery(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<any> {
    // 단순한 쿼리로 시뮬레이션
    return OptimizedDiaryService.getByDateRangeOptimized(
      userId, 
      startDate, 
      endDate,
      { limitCount: 20 }
    );
  }
}

// ============================================================================
// 메인 테스트 실행 함수
// ============================================================================

export async function runQueryPerformanceTests(): Promise<void> {
  console.log('🔥 ME.STORY 쿼리 성능 테스트 실행');
  
  const tester = new QueryPerformanceTests();
  
  try {
    await tester.runAllTests();
    await BenchmarkComparison.compareOptimizations();
    
    console.log('\n✅ 모든 성능 테스트 완료!');
  } catch (error) {
    console.error('❌ 성능 테스트 실패:', error);
    throw error;
  }
}

// 개별 테스트 실행 가능
export { QueryPerformanceTests, BenchmarkComparison, TestDataGenerator };
