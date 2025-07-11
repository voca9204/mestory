import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Mission, MissionType, MissionProgress } from '../types/missions'
import { generateMixedMissions, MISSION_COUNTS } from '../types/missionContent'

interface MissionSettings {
  startDate: string
  duration: number
  reminderTime: string
  missionType: MissionType
  selectedMissionTypes?: MissionType[]
}

interface MissionState {
  activeMissions: Mission[]
  missionProgress: Record<string, MissionProgress[]>
  
  // Actions
  createMission: (settings: MissionSettings, userId: string) => Mission
  updateMissionProgress: (missionId: string, date: string, progress: Partial<MissionProgress>) => void
  completeMissionDay: (missionId: string, date: string, note?: string) => void
  uncompleteMissionDay: (missionId: string, date: string) => void
  getMissionProgress: (missionId: string) => MissionProgress[]
  getActiveMissions: () => Mission[]
  getMissionById: (missionId: string) => Mission | undefined
  deleteMission: (missionId: string) => void
  
  // Computed values
  getMixedMissions: (mission: Mission) => Record<number, string>
  getProgressPercentage: (missionId: string) => number
  getRemainingDays: (missionId: string) => number
  getTotalItemsToDiscard: (missionId: string) => number
  isDayCompleted: (missionId: string, date: string) => boolean
  canCompleteDay: (missionId: string, date: string) => boolean
}

const useMissionStore = create<MissionState>()(
  persist(
    (set, get) => ({
      activeMissions: [],
      missionProgress: {},
      
      createMission: (settings, userId) => {
        const mission: Mission = {
          id: `mission-${Date.now()}`,
          type: settings.missionType,
          startDate: settings.startDate,
          duration: settings.duration,
          completedDays: [],
          isActive: true,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          selectedMissionTypes: settings.selectedMissionTypes
        }
        
        set((state) => ({
          activeMissions: [...state.activeMissions, mission],
          missionProgress: {
            ...state.missionProgress,
            [mission.id]: []
          }
        }))
        
        return mission
      },
      
      updateMissionProgress: (missionId, date, progress) => {
        set((state) => {
          const missionProgress = state.missionProgress[missionId] || []
          const existingIndex = missionProgress.findIndex(p => p.date === date)
          
          if (existingIndex >= 0) {
            missionProgress[existingIndex] = {
              ...missionProgress[existingIndex],
              ...progress
            }
          } else {
            missionProgress.push({
              missionId,
              date,
              completed: false,
              ...progress
            })
          }
          
          return {
            missionProgress: {
              ...state.missionProgress,
              [missionId]: missionProgress
            }
          }
        })
      },
      
      completeMissionDay: (missionId, date, note) => {
        const mission = get().getMissionById(missionId)
        if (!mission) return
        
        set((state) => {
          const updatedMission = {
            ...mission,
            completedDays: [...mission.completedDays, date].filter(
              (d, i, arr) => arr.indexOf(d) === i
            ),
            updatedAt: new Date()
          }
          
          return {
            activeMissions: state.activeMissions.map(m =>
              m.id === missionId ? updatedMission : m
            )
          }
        })
        
        get().updateMissionProgress(missionId, date, {
          completed: true,
          note,
          itemsCompleted: mission.type === MissionType.DECLUTTER
            ? MISSION_COUNTS[new Date(date).getDate()] || 1
            : 1
        })
      },
      
      uncompleteMissionDay: (missionId, date) => {
        const mission = get().getMissionById(missionId)
        if (!mission) return
        
        set((state) => {
          const updatedMission = {
            ...mission,
            completedDays: mission.completedDays.filter(d => d !== date),
            updatedAt: new Date()
          }
          
          return {
            activeMissions: state.activeMissions.map(m =>
              m.id === missionId ? updatedMission : m
            )
          }
        })
        
        get().updateMissionProgress(missionId, date, {
          completed: false
        })
      },
      
      getMissionProgress: (missionId) => {
        return get().missionProgress[missionId] || []
      },
      
      getActiveMissions: () => {
        return get().activeMissions.filter(m => m.isActive)
      },
      
      getMissionById: (missionId) => {
        return get().activeMissions.find(m => m.id === missionId)
      },
      
      deleteMission: (missionId) => {
        set((state) => ({
          activeMissions: state.activeMissions.filter(m => m.id !== missionId),
          missionProgress: Object.fromEntries(
            Object.entries(state.missionProgress).filter(([id]) => id !== missionId)
          )
        }))
      },
      
      getMixedMissions: (mission) => {
        if (mission.type === MissionType.MIXED && mission.selectedMissionTypes) {
          return generateMixedMissions(mission.selectedMissionTypes, mission.duration)
        }
        return {}
      },
      
      getProgressPercentage: (missionId) => {
        const mission = get().getMissionById(missionId)
        if (!mission) return 0
        
        return Math.round((mission.completedDays.length / mission.duration) * 100)
      },
      
      getRemainingDays: (missionId) => {
        const mission = get().getMissionById(missionId)
        if (!mission) return 0
        
        return mission.duration - mission.completedDays.length
      },
      
      getTotalItemsToDiscard: (missionId) => {
        const mission = get().getMissionById(missionId)
        if (!mission || mission.type !== MissionType.DECLUTTER) return 0
        
        let total = 0
        for (let i = 1; i <= mission.duration && i <= 30; i++) {
          total += MISSION_COUNTS[i] || 1
        }
        
        if (mission.duration > 30) {
          const avgPerDay = total / 30
          total += Math.round(avgPerDay * (mission.duration - 30))
        }
        
        return total
      },
      
      isDayCompleted: (missionId, date) => {
        const mission = get().getMissionById(missionId)
        return mission ? mission.completedDays.includes(date) : false
      },
      
      canCompleteDay: (missionId, date) => {
        const mission = get().getMissionById(missionId)
        if (!mission) return false
        
        const missionStartDate = new Date(mission.startDate)
        const targetDate = new Date(date)
        const today = new Date()
        
        // Cannot complete future dates
        if (targetDate > today) return false
        
        // Cannot complete dates before mission start
        if (targetDate < missionStartDate) return false
        
        // Cannot complete dates beyond mission duration
        const daysSinceStart = Math.floor(
          (targetDate.getTime() - missionStartDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysSinceStart >= mission.duration) return false
        
        return true
      }
    }),
    {
      name: 'mission-storage',
      partialize: (state) => ({
        activeMissions: state.activeMissions,
        missionProgress: state.missionProgress
      })
    }
  )
)

export default useMissionStore