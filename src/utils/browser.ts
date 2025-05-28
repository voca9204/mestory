// 브라우저 관련 유틸리티 함수들

/**
 * 인앱 브라우저 감지 함수
 * @returns {boolean} 인앱 브라우저인지 여부
 */
export const isInAppBrowser = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // 주요 인앱 브라우저들 감지
  const inAppBrowsers = [
    'kakao',           // 카카오톡
    'naver',           // 네이버 앱
    'whale',           // 네이버 웨일 (인앱)
    'instagram',       // 인스타그램
    'facebook',        // 페이스북
    'twitter',         // 트위터
    'line',            // 라인
    'wechat',          // 위챗
    'micromessenger',  // 위챗 (대체명)
    'webview',         // 일반적인 웹뷰
    'fb_iab',          // 페이스북 인앱
    'fbios',           // 페이스북 iOS
    'fban',            // 페이스북 안드로이드
    'trill',           // 틱톡
    'bytedance',       // 바이트댄스 앱들
  ];
  
  return inAppBrowsers.some(browser => userAgent.includes(browser));
};

/**
 * 모바일 브라우저 감지 함수
 * @returns {boolean} 모바일 브라우저인지 여부
 */
export const isMobileBrowser = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  const mobileKeywords = [
    'mobile',
    'android',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'windows phone',
  ];
  
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
};

/**
 * 브라우저 정보 반환 함수
 * @returns {object} 브라우저 정보 객체
 */
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  return {
    isInApp: isInAppBrowser(),
    isMobile: isMobileBrowser(),
    userAgent: navigator.userAgent,
    isChrome: userAgent.includes('chrome') && !userAgent.includes('edge'),
    isSafari: userAgent.includes('safari') && !userAgent.includes('chrome'),
    isFirefox: userAgent.includes('firefox'),
    isEdge: userAgent.includes('edge'),
  };
};

/**
 * Google OAuth에 적합한 브라우저인지 확인
 * @returns {boolean} OAuth에 적합한 브라우저인지 여부
 */
export const isOAuthCompatibleBrowser = (): boolean => {
  return !isInAppBrowser();
};

/**
 * 사용자에게 브라우저 안내 메시지 생성
 * @returns {string} 안내 메시지
 */
export const getBrowserGuidanceMessage = (): string => {
  const browserInfo = getBrowserInfo();
  
  if (browserInfo.isInApp) {
    if (browserInfo.isMobile) {
      return '앱 내 브라우저에서는 로그인이 제한됩니다. "Safari에서 열기" 또는 "Chrome에서 열기"를 선택해 주세요.';
    } else {
      return '현재 브라우저에서는 로그인이 제한됩니다. Chrome, Safari, Firefox 등의 기본 브라우저를 사용해 주세요.';
    }
  }
  
  return '';
};
