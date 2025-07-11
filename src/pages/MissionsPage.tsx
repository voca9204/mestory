import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MISSION_TYPE_INFO, MissionType } from '../types/missions'

const MissionsPage: React.FC = () => {
  const navigate = useNavigate()
  
  const handleMissionSelect = (missionType: MissionType) => {
    navigate('/missions/new', { state: { missionType } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900">30일 미션</h1>
          <p className="mt-2 text-lg text-gray-600">
            매일 작은 실천으로 만드는 큰 변화
          </p>
        </div>
      </div>

      {/* 미션 목록 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(MISSION_TYPE_INFO).map((mission) => (
            <button
              key={mission.type}
              onClick={() => handleMissionSelect(mission.type)}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${mission.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              
              <div className="p-8">
                <div className="text-5xl mb-4">{mission.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {mission.name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {mission.description}
                </p>
              </div>
              
              <div className={`h-1 bg-gradient-to-r ${mission.color}`}></div>
            </button>
          ))}
        </div>

        {/* 활성 미션 보기 버튼 */}
        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/missions/active')}
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
          >
            <span className="mr-2">🏃</span>
            진행 중인 미션 보기
          </button>
        </div>
      </div>
    </div>
  )
}

export default MissionsPage