// 인증 상태 관리 스토어
import { create } from 'zustand';
import { User } from 'firebase/auth';
import { UserProfile } from '../services/auth';

interface AuthState {
  // 상태
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  setUser: (user: User | null) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // 초기 상태
  user: null,
  userProfile: null,
  isLoading: true,
  error: null,

  // 액션
  setUser: (user) => set({ user }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));