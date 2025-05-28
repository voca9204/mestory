// Firebase 인증 상태 관리 훅
import { useEffect } from 'react';
import { User } from 'firebase/auth';
import { useAuthStore } from '../store/authStore';
import { onAuthStateChange, getUserProfile } from '../services/auth';

export const useAuth = () => {
  const { 
    user, 
    userProfile, 
    isLoading, 
    error,
    setUser, 
    setUserProfile, 
    setLoading, 
    setError,
    clearError 
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser: User | null) => {
      try {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // 사용자가 로그인된 경우 프로필 정보 가져오기
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } else {
          // 로그아웃된 경우 프로필 정보 클리어
          setUserProfile(null);
        }
      } catch (error) {
        console.error('사용자 프로필 로딩 오류:', error);
        setError('사용자 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setUserProfile, setLoading, setError]);

  return {
    user,
    userProfile,
    isLoading,
    error,
    isAuthenticated: !!user,
    clearError,
  };
};