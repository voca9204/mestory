import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, handleRedirectResult } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  setDemoMode: (isDemo: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // 리다이렉트 결과 처리 (페이지 로드 시 한 번만)
    const handleRedirect = async () => {
      try {
        const user = await handleRedirectResult();
        if (user) {
          console.log('리다이렉트 로그인 성공:', user.displayName);
        }
      } catch (error) {
        console.error('리다이렉트 처리 오류:', error);
      }
    };
    
    handleRedirect();

    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
      
      // 로그인하면 데모 모드 해제
      if (user) {
        setIsDemoMode(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const setDemoMode = (isDemo: boolean) => {
    setIsDemoMode(isDemo);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    isDemoMode,
    setDemoMode,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
