import { useState, useCallback, useRef } from 'react'
import { useData } from '../contexts/DataContext'

export function useTimeline2DData() {
  const { getDatesWithData, getDiaryByDate } = useData()
  
  // 캐시 상태
  const [yearDataCache, setYearDataCache] = useState<Map<number, Set<string>>>(new Map())
  const [loadingYears, setLoadingYears] = useState<Set<number>>(new Set())
  const diaryCache = useRef<Map<string, any>>(new Map())
  
  // 연도 데이터 로딩
  const loadYearData = useCallback(async (year: number) => {
    if (yearDataCache.has(year) || loadingYears.has(year)) {
      return
    }

    console.log(`📅 Loading data for year ${year}...`)
    setLoadingYears(prev => new Set(prev).add(year))
    
    try {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      
      const datesWithData = await getDatesWithData(startDate, endDate)
      const dateSet = new Set(datesWithData)
      
      setYearDataCache(prev => new Map(prev).set(year, dateSet))
      
      console.log(`✅ Year ${year}: Found ${datesWithData.length} dates with data`)
    } catch (error) {
      console.error(`❌ Error loading year ${year}:`, error)
    } finally {
      setLoadingYears(prev => {
        const newSet = new Set(prev)
        newSet.delete(year)
        return newSet
      })
    }
  }, [getDatesWithData, yearDataCache, loadingYears])

  // 데이터 존재 여부 확인
  const hasDataForDate = useCallback((date: Date): boolean => {
    const year = date.getFullYear()
    const dateString = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    const yearData = yearDataCache.get(year)
    if (yearData) {
      return yearData.has(dateString)
    }
    
    // 데이터가 없으면 로딩 시작
    if (!loadingYears.has(year)) {
      loadYearData(year)
    }
    
    return false
  }, [yearDataCache, loadingYears, loadYearData])

  // 일기 데이터 로딩 (캐시 활용)
  const loadDiaryForTooltip = useCallback(async (date: Date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    
    // 캐시 확인
    if (diaryCache.current.has(dateString)) {
      console.log(`💾 Diary cache hit for ${dateString}`)
      return diaryCache.current.get(dateString)
    }
    
    console.log(`📖 Loading diary for ${dateString}...`)
    
    try {
      const diary = await getDiaryByDate(dateString)
      
      // 캐시에 저장 (null도 캐시)
      diaryCache.current.set(dateString, diary)
      
      // 캐시 크기 제한 (최대 100개)
      if (diaryCache.current.size > 100) {
        const firstKey = diaryCache.current.keys().next().value
        diaryCache.current.delete(firstKey)
      }
      
      return diary
    } catch (error) {
      console.error(`❌ Error loading diary for ${dateString}:`, error)
      diaryCache.current.set(dateString, null)
      return null
    }
  }, [getDiaryByDate])

  // 보이는 연도 데이터 로드
  const loadVisibleYears = useCallback((visibleYears: number[]) => {
    const yearsToLoad = visibleYears.filter(year => 
      !yearDataCache.has(year) && !loadingYears.has(year)
    )
    
    yearsToLoad.forEach(year => loadYearData(year))
  }, [yearDataCache, loadingYears, loadYearData])

  // 캐시 초기화
  const clearCache = useCallback(() => {
    setYearDataCache(new Map())
    diaryCache.current.clear()
  }, [])

  return {
    yearDataCache,
    loadingYears,
    hasDataForDate,
    loadDiaryForTooltip,
    loadVisibleYears,
    loadYearData,
    clearCache
  }
}