import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { HomePage } from './pages/HomePage'
import { TimelinePage } from './pages/TimelinePage'
import { DiaryPage } from './pages/DiaryPage'
import { SettingsPage } from './pages/SettingsPage'
import { AuthPage } from './pages/AuthPage'
import MissionsPage from './pages/MissionsPage'
import NewMissionPage from './pages/NewMissionPage'
import ActiveMissionsPage from './pages/ActiveMissionsPage'
import { Navigation } from './components/Navigation'

// 로딩 스피너 컴포넌트
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-600">ME.STORY 로딩 중...</p>
    </div>
  </div>
);

// 인증이 필요한 앱 컴포넌트
const AuthenticatedApp = () => {
  const { isDemoMode } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 데모 모드일 때 상단에 배너 표시 */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm">
          🚀 데모 모드로 체험 중입니다. 실제 서비스를 이용하려면 Google 로그인을 해주세요.
        </div>
      )}
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/diary/:date?" element={<DiaryPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/missions/new" element={<NewMissionPage />} />
          <Route path="/missions/active" element={<ActiveMissionsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

// 메인 앱 컴포넌트
const AppContent = () => {
  const { user, loading, isDemoMode } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // 로그인되지 않았고 데모 모드도 아닌 경우
  if (!user && !isDemoMode) {
    return <AuthPage />;
  }

  // 로그인되었거나 데모 모드인 경우 앱 실행
  return (
    <DataProvider>
      <AuthenticatedApp />
    </DataProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
