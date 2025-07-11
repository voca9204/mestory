// Firebase 초기화 설정
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { ENV } from '../utils/env';

// Firebase 설정 (환경변수 검증 포함)
const firebaseConfig = {
  apiKey: ENV.firebase.apiKey(),
  authDomain: ENV.firebase.authDomain(),
  projectId: ENV.firebase.projectId(),
  storageBucket: ENV.firebase.storageBucket(),
  messagingSenderId: ENV.firebase.messagingSenderId(),
  appId: ENV.firebase.appId(),
  measurementId: ENV.firebase.measurementId()
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// 개발 환경에서 에뮬레이터 연결 (선택사항)
if (ENV.mode.isDevelopment() && ENV.features.useEmulator()) {
  console.log('Connecting to Firebase emulators...');
  
  // Auth 에뮬레이터
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  
  // Firestore 에뮬레이터
  connectFirestoreEmulator(db, 'localhost', 8080);
  
  // Storage 에뮬레이터
  connectStorageEmulator(storage, 'localhost', 9199);
  
  // Functions 에뮬레이터
  connectFunctionsEmulator(functions, 'localhost', 5001);
  
  console.log('Firebase emulators connected successfully');
}

export default app;