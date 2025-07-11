import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MISSION_TYPE_INFO, MissionType } from '../types/missions'
import { format } from 'date-fns'
import useMissionStore from '../store/missionStore'

interface LocationState {
  missionType: MissionType
}

const NewMissionPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { createMission } = useMissionStore()
  
  const state = location.state as LocationState
  const missionType = state?.missionType || MissionType.DECLUTTER
  const missionInfo = MISSION_TYPE_INFO[missionType]
  
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [duration, setDuration] = useState(30)
  const [reminderTime, setReminderTime] = useState('09:00')
  const [selectedMissionTypes, setSelectedMissionTypes] = useState<MissionType[]>([])
  
  useEffect(() => {
    if (!state?.missionType) {
      navigate('/missions')
    }
  }, [state, navigate])

  const handleToggleMissionType = (type: MissionType) => {
    setSelectedMissionTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type)
      }
      return [...prev, type]
    })
  }

  const handleStartMission = async () => {
    // 데모 모드에서는 'demo-user' ID 사용
    const userId = user?.uid || 'demo-user'

    // 미션 생성
    createMission({
      startDate,
      duration,
      reminderTime,
      missionType,
      selectedMissionTypes: missionType === MissionType.MIXED ? selectedMissionTypes : undefined
    }, userId)
    
    alert('미션이 시작되었습니다!')
    navigate('/missions/active')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span className="mr-2">←</span>
          뒤로가기
        </button>

        {/* 미션 정보 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <span className="text-6xl mr-4">{missionInfo.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {missionInfo.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {missionInfo.description}
              </p>
            </div>
          </div>
          
          <div className={`h-1 bg-gradient-to-r ${missionInfo.color} rounded-full`}></div>
        </div>

        {/* 설정 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">미션 설정</h2>
          
          <div className="space-y-6">
            {/* 시작일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시작일
              </label>
              <input
                type="date"
                value={startDate}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 기간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                미션 기간
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value={7}>7일</option>
                <option value={14}>14일</option>
                <option value={21}>21일</option>
                <option value={30}>30일</option>
                <option value={60}>60일</option>
                <option value={90}>90일</option>
              </select>
            </div>

            {/* 알림 시간 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                알림 시간
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* 종합 미션 선택 (종합 미션인 경우만) */}
            {missionType === MissionType.MIXED && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  포함할 미션 선택 (2개 이상)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.values(MISSION_TYPE_INFO)
                    .filter(m => m.type !== MissionType.MIXED && m.type !== MissionType.DECLUTTER)
                    .map((m) => (
                      <label
                        key={m.type}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedMissionTypes.includes(m.type)
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMissionTypes.includes(m.type)}
                          onChange={() => handleToggleMissionType(m.type)}
                          className="sr-only"
                        />
                        <span className="text-2xl mr-2">{m.icon}</span>
                        <span className="text-sm font-medium">{m.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* 시작 버튼 */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate('/missions')}
              className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
            >
              취소
            </button>
            <button
              onClick={handleStartMission}
              disabled={missionType === MissionType.MIXED && selectedMissionTypes.length < 2}
              className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-colors duration-200 ${
                missionType === MissionType.MIXED && selectedMissionTypes.length < 2
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              미션 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewMissionPage