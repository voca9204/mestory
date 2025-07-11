import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { 
  HomeIcon, 
  CalendarIcon, 
  BookOpenIcon, 
  CogIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  BookOpenIcon as BookOpenIconSolid,
  CogIcon as CogIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  TrophyIcon as TrophyIconSolid
} from '@heroicons/react/24/solid'
import { useAuth } from '../contexts/AuthContext'
import { logOut, signInWithGoogle } from '../services/auth'

const navigationItems = [
  { name: '홈', href: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
  { name: '타임라인', href: '/timeline', icon: CalendarIcon, activeIcon: CalendarIconSolid },
  { name: '일기', href: '/diary', icon: BookOpenIcon, activeIcon: BookOpenIconSolid },
  { name: '미션', href: '/missions', icon: TrophyIcon, activeIcon: TrophyIconSolid },
  { name: '분석', href: '/analytics', icon: ChartBarIcon, activeIcon: ChartBarIconSolid },
  { name: '설정', href: '/settings', icon: CogIcon, activeIcon: CogIconSolid },
]

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isDemoMode, setDemoMode } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      await logOut()
      setShowUserMenu(false)
      setDemoMode(false)
      navigate('/')
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  const handleLogin = async () => {
    try {
      await signInWithGoogle()
      setDemoMode(false)
    } catch (error) {
      console.error('로그인 실패:', error)
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ME.STORY</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const active = isActive(item.href)
              const Icon = active ? item.activeIcon : item.icon
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center relative">
            {isDemoMode ? (
              // 데모 모드일 때 로그인 버튼
              <button
                onClick={handleLogin}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <UserCircleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Google 로그인</span>
              </button>
            ) : (
              // 로그인된 사용자 메뉴
              <>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
                >
                  {user?.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="w-8 h-8" />
                  )}
                  <span className="text-sm font-medium">{user?.displayName || 'User'}</span>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      <span>로그아웃</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 4).map((item) => {
            const active = isActive(item.href)
            const Icon = active ? item.activeIcon : item.icon
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center space-y-1 px-2 py-2 text-xs font-medium ${
                  active
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
          
          <Link
            to="/settings"
            className={`flex flex-col items-center space-y-1 px-2 py-2 text-xs font-medium ${
              isActive('/settings')
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <CogIcon className="w-5 h-5" />
            <span>설정</span>
          </Link>
        </div>
      </div>

      {/* Backdrop for closing user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  )
}
