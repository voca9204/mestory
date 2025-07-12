import React from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import useMissionStore from '../store/missionStore'
import { MISSION_TYPE_INFO, MissionType } from '../types/missions'
import { MISSIONS_BY_TYPE, generateMixedMissions } from '../types/missionContent'
import { useAuth } from '../contexts/AuthContext'

const ActiveMissionsPage: React.FC = () => {
  const navigate = useNavigate()
  const { 
    getActiveMissions, 
    getProgressPercentage,
    getRemainingDays,
    isDayCompleted,
    canCompleteDay,
    completeMissionDay,
    uncompleteMissionDay,
    deleteMission
  } = useMissionStore()
  
  const activeMissions = getActiveMissions()
  const today = format(new Date(), 'yyyy-MM-dd')
  
  const handleToggleComplete = (missionId: string, date: string) => {
    if (isDayCompleted(missionId, date)) {
      uncompleteMissionDay(missionId, date)
    } else if (canCompleteDay(missionId, date)) {
      completeMissionDay(missionId, date)
    }
  }
  
  const handleDeleteMission = (missionId: string) => {
    if (window.confirm('정말로 이 미션을 삭제하시겠습니까?')) {
      deleteMission(missionId)
    }
  }
  
  if (activeMissions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <span className="text-6xl mb-4 block">🎯</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              진행 중인 미션이 없습니다
            </h2>
            <p className="text-gray-600 mb-8">
              새로운 미션을 시작해보세요!
            </p>
            <button
              onClick={() => navigate('/missions')}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
            >
              미션 시작하기
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">진행 중인 미션</h1>
          <p className="mt-2 text-lg text-gray-600">
            오늘도 한 걸음 더 성장하세요
          </p>
        </div>
      </div>
      
      {/* 미션 목록 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeMissions.map((mission) => {
            const missionInfo = MISSION_TYPE_INFO[mission.type]
            const progressPercentage = getProgressPercentage(mission.id)
            const remainingDays = getRemainingDays(mission.id)
            const todayCompleted = isDayCompleted(mission.id, today)
            
            // 오늘이 미션의 몇 번째 날인지 계산
            const startDate = new Date(mission.startDate)
            const todayDate = new Date()
            const daysSinceStart = Math.floor(
              (todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )
            const currentDay = Math.min(daysSinceStart + 1, mission.duration)
            
            // 종합 미션인 경우 generateMixedMissions 사용
            let todayMission: string
            if (mission.type === MissionType.MIXED && mission.selectedMissionTypes) {
              const mixedMissions = generateMixedMissions(mission.selectedMissionTypes, mission.duration)
              todayMission = mixedMissions[currentDay] || '오늘의 미션'
            } else {
              todayMission = MISSIONS_BY_TYPE[mission.type]?.[currentDay] || '오늘의 미션'
            }
            
            return (
              <div
                key={mission.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* 미션 헤더 */}
                <div className={`p-6 text-white bg-gradient-to-br ${missionInfo.color}`}>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{missionInfo.icon}</span>
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                      {currentDay}일차
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{missionInfo.name}</h3>
                  <p className="text-sm opacity-90">{missionInfo.description}</p>
                </div>
                
                {/* 진행률 */}
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>진행률</span>
                      <span className="font-medium">{progressPercentage}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* 오늘의 미션 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      오늘의 미션
                    </p>
                    <p className="text-gray-600 text-sm">{todayMission}</p>
                  </div>
                  
                  {/* 상태 정보 */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">남은 일수</p>
                      <p className="font-semibold text-gray-900">{remainingDays}일</p>
                    </div>
                    <div>
                      <p className="text-gray-500">완료한 날</p>
                      <p className="font-semibold text-gray-900">{mission.completedDays.length}일</p>
                    </div>
                  </div>
                  
                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    {canCompleteDay(mission.id, today) && (
                      <button
                        onClick={() => handleToggleComplete(mission.id, today)}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200 ${
                          todayCompleted
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {todayCompleted ? '완료 취소' : '오늘 완료'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMission(mission.id)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors duration-200"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* 새 미션 추가 버튼 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/missions?add=true')}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
          >
            <span className="mr-2">+</span>
            새 미션 추가
          </button>
        </div>
      </div>
    </div>
  )
}

export default ActiveMissionsPage