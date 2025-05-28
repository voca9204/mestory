// ME.STORY Firebase Cloud Functions
// 미디어 처리 및 백엔드 로직

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

// 이미지 처리 함수 import
export { processImage } from './services/imageProcessor';

// ============================================================================
// HTTP Functions (API 엔드포인트)
// ============================================================================

// 업로드 URL 생성 (서명된 URL)
export const generateUploadUrl = functions
  .region('asia-northeast3')
  .https
  .onCall(async (data, context) => {
    // 인증 확인
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required'
      );
    }
    
    const { fileName, contentType } = data;
    const userId = context.auth.uid;
    
    try {
      const bucket = admin.storage().bucket();
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      
      const filePath = `users/${userId}/media/originals/${year}/${month}/${fileName}`;
      const file = bucket.file(filePath);
      
      // 15분간 유효한 업로드 URL 생성
      const [uploadUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15분
        contentType
      });
      
      return { uploadUrl, filePath };
    } catch (error) {
      console.error('Upload URL generation failed:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate upload URL'
      );
    }
  });

// 다운로드 URL 생성 (서명된 URL)
export const generateDownloadUrl = functions
  .region('asia-northeast3')
  .https
  .onCall(async (data, context) => {
    // 인증 확인
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'Authentication required'
      );
    }
    
    const { filePath } = data;
    const userId = context.auth.uid;
    
    // 파일 경로에서 userId 추출하여 권한 확인
    if (!filePath.startsWith(`users/${userId}/`)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Access denied to this file'
      );
    }
    
    try {
      const bucket = admin.storage().bucket();
      const file = bucket.file(filePath);
      
      // 1시간간 유효한 다운로드 URL 생성
      const [downloadUrl] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000 // 1시간
      });
      
      return { downloadUrl };
    } catch (error) {
      console.error('Download URL generation failed:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Failed to generate download URL'
      );
    }
  });

// ============================================================================
// 미디어 관리 Functions
// ============================================================================

// 미디어 메타데이터 업데이트
export const updateMediaMetadata = functions
  .region('asia-northeast3')
  .https
  .onCall(async (data, context) => {
    // 인증 확인
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const { mediaId, updates, year } = data;
    const userId = context.auth.uid;

    try {
      const db = admin.firestore();
      const currentYear = year || new Date().getFullYear();
      const mediaRef = db.collection(`media-${currentYear}`).doc(mediaId);
      
      // 기존 데이터 확인
      const mediaDoc = await mediaRef.get();
      if (!mediaDoc.exists) {
        throw new functions.https.HttpsError('not-found', '미디어를 찾을 수 없습니다.');
      }

      const mediaData = mediaDoc.data();
      if (mediaData?.userId !== userId) {
        throw new functions.https.HttpsError('permission-denied', '권한이 없습니다.');
      }

      // 업데이트 실행
      await mediaRef.update({
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating media metadata:', error);
      throw error;
    }
  });

// 사용자 미디어 통계 조회
export const getMediaStats = functions
  .region('asia-northeast3')
  .https
  .onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const userId = context.auth.uid;
    const { year } = data;

    try {
      const db = admin.firestore();
      const currentYear = year || new Date().getFullYear();
      
      const mediaQuery = await db
        .collection(`media-${currentYear}`)
        .where('userId', '==', userId)
        .get();

      let totalSize = 0;
      let totalCount = 0;
      const statusCounts = {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0
      };

      mediaQuery.forEach((doc) => {
        const data = doc.data();
        totalCount++;
        totalSize += data.size || 0;
        
        const status = data.processingStatus || 'pending';
        statusCounts[status as keyof typeof statusCounts]++;
      });

      return {
        totalCount,
        totalSize,
        statusCounts,
        averageSize: totalCount > 0 ? totalSize / totalCount : 0
      };
    } catch (error) {
      console.error('Error getting media stats:', error);
      throw error;
    }
  });

// ============================================================================
// 배치 처리 Functions
// ============================================================================

// 매일 임시 파일 정리 (Cron job)
export const cleanupTempFiles = functions
  .region('asia-northeast3')
  .pubsub
  .schedule('0 2 * * *') // 매일 오전 2시 (KST)
  .timeZone('Asia/Seoul')
  .onRun(async (context) => {
    const storage = admin.storage();
    const bucket = storage.bucket();
    
    try {
      console.log('Starting temp files cleanup');
      
      // temp 폴더의 24시간 이상 된 파일들 삭제
      const [files] = await bucket.getFiles({
        prefix: 'temp/',
      });

      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000; // 24시간
      let deletedCount = 0;

      const deletePromises = files.map(async (file) => {
        try {
          const [metadata] = await file.getMetadata();
          const created = new Date(metadata.timeCreated).getTime();
          
          if (now - created > dayInMs) {
            console.log(`Deleting temp file: ${file.name}`);
            await file.delete();
            deletedCount++;
          }
        } catch (error) {
          console.error(`Error deleting temp file ${file.name}:`, error);
        }
      });

      await Promise.all(deletePromises);
      console.log(`Temp files cleanup completed: ${deletedCount} files deleted`);
      
    } catch (error) {
      console.error('Temp files cleanup failed:', error);
    }
    
    return null;
  });

// ============================================================================
// 에러 핸들링 및 모니터링
// ============================================================================

// 전역 에러 핸들러
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

export default {
  processImage,
  generateUploadUrl,
  generateDownloadUrl,
  updateMediaMetadata,
  getMediaStats,
  cleanupTempFiles
};
