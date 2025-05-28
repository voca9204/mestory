// 일기 데이터 관리 훅
import { useState, useEffect, useCallback } from 'react';
import { DiaryEntry, DiaryService } from '../services/database';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';

export const useDiary = (date?: Date) => {
  const { user } = useAuthStore();
  const { selectedDate, cacheDiary, getCachedDiary, getDateKey } = useAppStore();
  const targetDate = date || selectedDate;
  const dateKey = getDateKey(targetDate);

  const [diary, setDiary] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 일기 로드
  const loadDiary = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // 캐시에서 먼저 확인
      const cached = getCachedDiary(dateKey);
      if (cached) {
        setDiary(cached);
        setIsLoading(false);
        return;
      }

      // Firestore에서 로드
      const diaryEntry = await DiaryService.getByDate(user.uid, targetDate);
      setDiary(diaryEntry);
      
      // 캐시에 저장
      if (diaryEntry) {
        cacheDiary(dateKey, diaryEntry);
      }
    } catch (err) {
      console.error('일기 로드 오류:', err);
      setError('일기를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [user, targetDate, dateKey, getCachedDiary, cacheDiary]);

  // 일기 저장
  const saveDiary = useCallback(async (diaryData: Omit<DiaryEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('로그인이 필요합니다.');

    try {
      setIsLoading(true);
      setError(null);

      const entryData = {
        ...diaryData,
        userId: user.uid,
      };

      let savedDiary: DiaryEntry;

      if (diary?.id) {
        // 기존 일기 업데이트
        await DiaryService.updateEntry(diary.id, entryData);
        savedDiary = {
          ...diary,
          ...entryData,
          updatedAt: new Date(),
        };
      } else {
        // 새 일기 생성
        const id = await DiaryService.createEntry(entryData);
        savedDiary = {
          id,
          ...entryData,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      setDiary(savedDiary);
      cacheDiary(dateKey, savedDiary);
      
      return savedDiary;
    } catch (err) {
      console.error('일기 저장 오류:', err);
      setError('일기 저장에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user, diary, dateKey, cacheDiary]);

  // 일기 삭제
  const deleteDiary = useCallback(async () => {
    if (!diary?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      await DiaryService.deleteEntry(diary.id);
      setDiary(null);
      
      // 캐시에서도 제거
      cacheDiary(dateKey, null as any);
    } catch (err) {
      console.error('일기 삭제 오류:', err);
      setError('일기 삭제에 실패했습니다.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [diary, dateKey, cacheDiary]);

  // 날짜 변경 시 자동 로드
  useEffect(() => {
    loadDiary();
  }, [loadDiary]);

  return {
    diary,
    isLoading,
    error,
    saveDiary,
    deleteDiary,
    reloadDiary: loadDiary,
    hasDiary: !!diary,
  };
};