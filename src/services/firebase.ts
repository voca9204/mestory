// Firebase 초기화 설정
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase 설정
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// 개발 환경에서 에뮬레이터 연결 (선택사항)
if (import.meta.env.NODE_ENV === 'development' && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  // Auth 에뮬레이터
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  
  // Firestore 에뮬레이터
  connectFirestoreEmulator(db, 'localhost', 8080);
  
  // Storage 에뮬레이터
  connectStorageEmulator(storage, 'localhost', 9199);
  
  // Functions 에뮬레이터
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export default app;