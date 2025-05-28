import React, { useState, useEffect } from 'react'
import { 
  CloudArrowUpIcon, 
  LinkIcon, 
  BellIcon,
  ShieldCheckIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'
import { getUserProfile, logOut } from '../services/auth'
import { UserProfileEditor } from '../components/UserProfileEditor'
import type { UserProfile } from '../services/auth'

interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  autoBackup: boolean;
  syncSNS: boolean;
}

export function SettingsPage() {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    notifications: true,
    autoBackup: true,
    syncSNS: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // 사용자 프로필 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return
      
      setIsLoading(true)
      try {
        const profile = await getUserProfile(user.uid)
        if (profile) {
          setUserProfile(profile)
          setSettings(profile.settings || settings)
        }
      } catch (error) {
        console.error('프로필 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [user])

  // 프로필 업데이트 핸들러
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile)
    setSaveMessage('프로필이 성공적으로 업데이트되었습니다.')
    setTimeout(() => setSaveMessage(''), 3000)
  }

  // 로그아웃
  const handleLogout = async () => {
    try {
      await logOut()
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  // 계정 연동 상태
  const getConnectionStatus = (service: string) => {
    switch (service) {
      case 'Google':
        return user ? { connected: true, status: '연결됨' } : { connected: false, status: '연결 안됨' }
      default:
        return { connected: false, status: '연결 안됨' }
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">프로필 로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        {saveMessage && (
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
            {saveMessage}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <UserProfileEditor 
          userProfile={userProfile}
          onProfileUpdate={handleProfileUpdate}
        />

        {/* 앱 설정 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <BellIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">앱 설정</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium">테마</h3>
                <p className="text-sm text-gray-600">앱의 색상 테마를 선택하세요</p>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                className="border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">라이트</option>
                <option value="dark">다크</option>
              </select>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <h3 className="font-medium">푸시 알림</h3>
                <p className="text-sm text-gray-600">일기 작성 리마인더 및 기타 알림</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium">자동 백업</h3>
                <p className="text-sm text-gray-600">데이터를 클라우드에 자동으로 백업</p>
              </div>
              <button
                onClick={() => setSettings(prev => ({ ...prev, autoBackup: !prev.autoBackup }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 계정 연동 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <LinkIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">계정 연동</h2>
          </div>
          
          <div className="space-y-3">
            {[
              { name: 'Google', description: 'Google 계정으로 로그인' },
              { name: 'Facebook', description: 'Facebook 포스트 동기화 (준비 중)' },
              { name: 'Instagram', description: 'Instagram 사진 동기화 (준비 중)' },
              { name: 'KakaoTalk', description: '카카오톡 메시지 분석 (준비 중)' },
            ].map((service) => {
              const status = getConnectionStatus(service.name)
              return (
                <div key={service.name} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {status.connected ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-gray-400" />
                    )}
                    <span className={`text-sm px-2 py-1 rounded ${
                      status.connected 
                        ? 'text-green-700 bg-green-100' 
                        : 'text-gray-600 bg-gray-100'
                    }`}>
                      {status.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 데이터 관리 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <CloudArrowUpIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">데이터 관리</h2>
          </div>
          
          <div className="space-y-4">
            <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              데이터 내보내기
            </button>
            
            <button className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors ml-0 sm:ml-3">
              지금 백업하기
            </button>
            
            <div className="text-sm text-gray-600 mt-2">
              <p>• 데이터 내보내기: 모든 일기와 사진을 JSON 형태로 다운로드</p>
              <p>• 백업: 클라우드에 현재 데이터 상태 저장</p>
            </div>
          </div>
        </div>

        {/* 계정 관리 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">계정 관리</h2>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              로그아웃
            </button>
            
            <div className="border-t pt-4">
              <h3 className="font-medium text-red-600 mb-3">위험 구역</h3>
              <p className="text-sm text-gray-600 mb-3">
                아래 작업은 되돌릴 수 없습니다. 신중하게 진행해 주세요.
              </p>
              <button className="flex items-center gap-2 text-red-600 hover:text-red-700 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
                <TrashIcon className="w-4 h-4" />
                모든 데이터 삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
