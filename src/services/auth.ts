// Firebase Authentication 서비스
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { isInAppBrowser } from '../utils/browser';

// 사용자 프로필 타입
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Google 로그인 프로바이더
const googleProvider = new GoogleAuthProvider();

// 리다이렉트 결과 처리 함수
export const handleRedirectResult = async (): Promise<User | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      // 기존 사용자인지 확인
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // 신규 사용자라면 프로필 생성
        const userProfile: UserProfile = {
          uid: result.user.uid,
          email: result.user.email!,
          displayName: result.user.displayName || '익명',
          photoURL: result.user.photoURL || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          settings: {
            theme: 'light',
            notifications: true,
          },
        };
        
        await setDoc(doc(db, 'users', result.user.uid), userProfile);
      }
      
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('리다이렉트 결과 처리 오류:', error);
    throw error;
  }
};

// 회원가입
export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // 프로필 업데이트
    await updateProfile(user, { displayName });
    
    // Firestore에 사용자 정보 저장
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      photoURL: user.photoURL || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        theme: 'light',
        notifications: true,
      },
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    return user;
  } catch (error) {
    console.error('회원가입 오류:', error);
    throw error;
  }
};

// 로그인
export const signIn = async (email: string, password: string) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    console.error('로그인 오류:', error);
    throw error;
  }
};

// Google 로그인 (개선된 버전 - 인앱 브라우저 대응)
export const signInWithGoogle = async () => {
  try {
    // 인앱 브라우저인지 확인
    if (isInAppBrowser()) {
      // 인앱 브라우저의 경우 리다이렉트 방식 사용
      console.log('인앱 브라우저 감지 - 리다이렉트 방식 사용');
      await signInWithRedirect(auth, googleProvider);
      // 리다이렉트 방식은 즉시 반환하지 않고 페이지가 리다이렉트됨
      return null;
    } else {
      // 일반 브라우저의 경우 팝업 방식 사용
      const { user } = await signInWithPopup(auth, googleProvider);
      
      // 기존 사용자인지 확인
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // 신규 사용자라면 프로필 생성
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || '익명',
          photoURL: user.photoURL || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          settings: {
            theme: 'light',
            notifications: true,
          },
        };
        
        await setDoc(doc(db, 'users', user.uid), userProfile);
      }
      
      return user;
    }
  } catch (error: any) {
    console.error('Google 로그인 오류:', error);
    
    // 403 disallowed_useragent 오류 처리
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/popup-closed-by-user' ||
        error.message?.includes('disallowed_useragent')) {
      
      // 팝업이 차단되거나 인앱 브라우저 문제인 경우 리다이렉트 방식으로 재시도
      console.log('팝업 차단 또는 User-Agent 문제 감지 - 리다이렉트 방식으로 재시도');
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    
    throw error;
  }
};

// 로그아웃
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
};

// 비밀번호 재설정
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('비밀번호 재설정 오류:', error);
    throw error;
  }
};

// 사용자 프로필 가져오기
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('프로필 가져오기 오류:', error);
    throw error;
  }
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...updates,
      updatedAt: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    throw error;
  }
};

// 인증 상태 변경 리스너
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};