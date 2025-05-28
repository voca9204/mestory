import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';
import * as sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();
const storage = getStorage();

// 이미지 메타데이터 인터페이스
interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  hasAlpha: boolean;
  exif?: any;
}

// 썸네일 크기 정의
const THUMBNAIL_SIZES = {
  small: { width: 150, height: 150 },
  medium: { width: 400, height: 400 },
  large: { width: 800, height: 800 }
};

/**
 * 이미지 업로드 시 자동으로 처리하는 함수
 * - 썸네일 생성
 * - WebP 변환
 * - EXIF 데이터 추출
 * - 메타데이터 저장
 */
export const processImage = functions
  .region('asia-northeast3') // 서울 리전
  .storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name;
    const bucket = storage.bucket(object.bucket);
    
    // 업로드된 파일이 이미지인지 확인
    if (!object.contentType?.startsWith('image/')) {
      console.log('Not an image file, skipping processing');
      return null;
    }

    // 이미 처리된 파일인지 확인 (무한 루프 방지)
    if (filePath?.includes('thumbnails/') || 
        filePath?.includes('compressed/') || 
        filePath?.includes('temp/')) {
      console.log('Already processed file, skipping');
      return null;
    }

    // 사용자 ID 및 파일 정보 추출
    const pathParts = filePath?.split('/') || [];
    if (pathParts.length < 4 || pathParts[0] !== 'users') {
      console.log('Invalid file path structure');
      return null;
    }

    const userId = pathParts[1];
    const fileName = path.basename(filePath || '');
    const fileId = uuidv4();

    console.log(`Processing image: ${fileName} for user: ${userId}`);

    try {
      // 임시 파일 경로 설정
      const tempFilePath = path.join(os.tmpdir(), fileName);
      
      // 원본 파일 다운로드
      await bucket.file(filePath!).download({ destination: tempFilePath });
      
      // Sharp로 이미지 정보 읽기
      const imageInfo = await sharp(tempFilePath).metadata();
      
      // EXIF 데이터 추출
      const exifData = await extractExifData(tempFilePath);
      
      // 썸네일 생성
      const thumbnails = await generateThumbnails(
        tempFilePath,
        userId,
        fileId,
        bucket
      );
      
      // WebP 압축 버전 생성
      const compressedVersions = await generateCompressedVersions(
        tempFilePath,
        userId,
        fileId,
        bucket
      );
      
      // 메타데이터 저장
      const metadata = {
        id: fileId,
        userId,
        originalName: fileName,
        mimeType: object.contentType,
        size: object.size,
        dimensions: {
          width: imageInfo.width || 0,
          height: imageInfo.height || 0
        },
        uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        storagePath: filePath,
        thumbnails,
        compressed: compressedVersions,
        exifData,
        processingStatus: 'completed',
        versions: {
          original: filePath!,
          thumbnail: thumbnails.medium,
          compressed: compressedVersions.webp || compressedVersions.jpeg
        }
      };

      // Firestore에 메타데이터 저장
      await db.collection(`media-${new Date().getFullYear()}`).doc(fileId).set(metadata);
      
      console.log(`Successfully processed image: ${fileName}`);
      
      // 임시 파일 정리
      fs.unlinkSync(tempFilePath);
      
      return { success: true, fileId, metadata };
      
    } catch (error) {
      console.error('Error processing image:', error);
      
      // 실패 상태 저장
      await db.collection(`media-${new Date().getFullYear()}`).doc(fileId).set({
        id: fileId,
        userId,
        originalName: fileName,
        processingStatus: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        uploadedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      throw error;
    }
  });

/**
 * EXIF 데이터 추출 함수
 */
async function extractExifData(filePath: string): Promise<any> {
  try {
    const sharp_instance = sharp(filePath);
    const metadata = await sharp_instance.metadata();
    
    // Sharp에서 제공하는 기본 EXIF 정보
    const exifData: any = {};
    
    if (metadata.exif) {
      // 여기서 exif-reader를 사용할 수 있지만, 
      // 현재는 Sharp의 기본 메타데이터만 사용
      exifData.orientation = metadata.orientation;
      exifData.density = metadata.density;
    }
    
    return exifData;
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return {};
  }
}

/**
 * 썸네일 생성 함수
 */
async function generateThumbnails(
  originalPath: string,
  userId: string,
  fileId: string,
  bucket: any
): Promise<{ small: string; medium: string; large: string }> {
  const thumbnails: { small: string; medium: string; large: string } = {
    small: '',
    medium: '',
    large: ''
  };

  for (const [size, dimensions] of Object.entries(THUMBNAIL_SIZES)) {
    const thumbnailPath = `users/${userId}/media/thumbnails/${size}/${fileId}.jpeg`;
    const tempThumbnailPath = path.join(os.tmpdir(), `${fileId}_${size}.jpeg`);
    
    try {
      // 썸네일 생성
      await sharp(originalPath)
        .resize(dimensions.width, dimensions.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 85 })
        .toFile(tempThumbnailPath);
      
      // Storage에 업로드
      await bucket.upload(tempThumbnailPath, {
        destination: thumbnailPath,
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            type: 'thumbnail',
            size: size,
            originalFileId: fileId
          }
        }
      });
      
      thumbnails[size as keyof typeof thumbnails] = thumbnailPath;
      
      // 임시 파일 정리
      fs.unlinkSync(tempThumbnailPath);
      
    } catch (error) {
      console.error(`Error generating ${size} thumbnail:`, error);
    }
  }

  return thumbnails;
}

/**
 * 압축 버전 생성 함수
 */
async function generateCompressedVersions(
  originalPath: string,
  userId: string,
  fileId: string,
  bucket: any
): Promise<{ webp?: string; jpeg?: string }> {
  const compressed: { webp?: string; jpeg?: string } = {};

  try {
    // WebP 버전 생성
    const webpPath = `users/${userId}/media/compressed/webp/${fileId}.webp`;
    const tempWebpPath = path.join(os.tmpdir(), `${fileId}.webp`);
    
    await sharp(originalPath)
      .webp({ quality: 80 })
      .toFile(tempWebpPath);
    
    await bucket.upload(tempWebpPath, {
      destination: webpPath,
      metadata: {
        contentType: 'image/webp',
        metadata: {
          type: 'compressed',
          format: 'webp',
          originalFileId: fileId
        }
      }
    });
    
    compressed.webp = webpPath;
    fs.unlinkSync(tempWebpPath);
    
  } catch (error) {
    console.error('Error generating WebP version:', error);
  }

  try {
    // 최적화된 JPEG 버전 생성
    const jpegPath = `users/${userId}/media/compressed/jpeg/${fileId}.jpeg`;
    const tempJpegPath = path.join(os.tmpdir(), `${fileId}_compressed.jpeg`);
    
    await sharp(originalPath)
      .jpeg({ quality: 75, progressive: true })
      .toFile(tempJpegPath);
    
    await bucket.upload(tempJpegPath, {
      destination: jpegPath,
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          type: 'compressed',
          format: 'jpeg',
          originalFileId: fileId
        }
      }
    });
    
    compressed.jpeg = jpegPath;
    fs.unlinkSync(tempJpegPath);
    
  } catch (error) {
    console.error('Error generating compressed JPEG version:', error);
  }

  return compressed;
}
