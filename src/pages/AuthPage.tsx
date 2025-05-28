import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../services/auth';
import { useAuth } from '../contexts/AuthContext';
import { TaskProgress } from '../components/TaskProgress';
import { taskProgress } from '../data/taskProgress';
import { isInAppBrowser, getBrowserGuidanceMessage } from '../utils/browser';

export const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTasks, setShowTasks] = useState(false);
  const [browserWarning, setBrowserWarning] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setDemoMode } = useAuth();

  // 컴포넌트 마운트 시 브라우저 호환성 확인
  useEffect(() => {
    if (isInAppBrowser()) {
      setBrowserWarning(getBrowserGuidanceMessage());
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await signInWithGoogle();
      
      // 리다이렉트 방식을 사용한 경우 result가 null이므로
      // 페이지가 리다이렉트되어 여기까지 오지 않음
      if (result) {
        // 팝업 방식 성공 시
        setDemoMode(false);
        navigate('/');
      }
      // result가 null인 경우는 리다이렉트 방식이므로 추가 처리 불필요
      
    } catch (error: any) {
      console.error('Google 로그인 실패:', error);
      
      // 구체적인 에러 메시지 제공
      let errorMessage = '로그인에 실패했습니다.';
      
      if (error.code === 'auth/popup-blocked') {
        errorMessage = '팝업이 차단되었습니다. 팝업을 허용하거나 다른 브라우저를 사용해 주세요.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = '로그인이 취소되었습니다.';
      } else if (error.message?.includes('disallowed_useragent') || 
                 error.message?.includes('403')) {
        errorMessage = '현재 브라우저에서는 로그인이 제한됩니다. Chrome, Safari, Firefox 등의 기본 브라우저를 사용해 주세요.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = '네트워크 연결을 확인해 주세요.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowseDemo = () => {
    setShowTasks(!showTasks);
  };

  const handleEnterDemo = () => {
    // 데모 모드로 앱 진입
    setDemoMode(true);
    navigate('/');
  };

  if (showTasks) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">ME.STORY 개발 진행 상황</h1>
              <div className="flex gap-3">
                <button
                  onClick={handleEnterDemo}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  🚀 데모 체험하기
                </button>
                <button
                  onClick={() => setShowTasks(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  로그인 페이지로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Task 진행 상황 */}
        <div className="py-8">
          <TaskProgress tasks={taskProgress} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl text-white font-bold">ME</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ME.STORY</h1>
          <p className="text-gray-600 text-lg">100년을 기록하는 개인 아카이브</p>
          <p className="text-sm text-gray-500 mt-2">
            특정 날짜의 "해상도"를 최대한 높여, 개인 기록과 시대적 맥락을 함께 제공하는 장기 일기 앱
          </p>
        </div>

        {/* 인증 카드 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            시작하기
          </h2>

          {/* 브라우저 호환성 경고 */}
          {browserWarning && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{browserWarning}</p>
                </div>
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Google 로그인 버튼 */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">Google로 로그인</span>
              </>
            )}
          </button>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* 둘러보기 버튼 */}
          <button
            onClick={handleBrowseDemo}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg px-4 py-3 font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            🚀 둘러보기 (개발 진행 상황 보기)
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            둘러보기를 클릭하면 현재 개발 중인 기능들과 진행 상황을 확인할 수 있습니다.
          </p>
        </div>

        {/* 하단 정보 */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <div className="bg-white/70 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-2">ME.STORY의 특별함</h3>
            <ul className="space-y-1 text-xs">
              <li>📅 2D 타임라인으로 시간을 직관적으로 탐색</li>
              <li>📸 사진과 함께하는 풍부한 기록</li>
              <li>🌍 개인 기록 + 시대적 맥락 통합</li>
              <li>🤖 AI 기반 추억 분석 및 큐레이션</li>
              <li>☁️ 100년간 안전한 클라우드 보관</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
