import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { storage, db } from './firebase';
import { auth } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// 미디어 메타데이터 타입
export interface MediaMetadata {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  dimensions: {
    width: number;
    height: number;
  };
  uploadedAt: Date;
  storagePath: string;
  downloadURL: string;
  thumbnails: {
    small: string;
    medium: string;
    large: string;
  };
  compressed: {
    webp?: string;
    jpeg?: string;
  };
  exifData?: any;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  associations: {
    diaryIds: string[];
    tags: string[];
  };
}

// 업로드 진행률 콜백 타입
export type UploadProgressCallback = (progress: number) => void;

// 업로드 완료 콜백 타입
export type UploadCompleteCallback = (metadata: MediaMetadata) => void;

// 업로드 에러 콜백 타입
export type UploadErrorCallback = (error: Error) => void;

/**
 * 미디어 파일 업로드 서비스
 */
export class MediaService {
  private static instance: MediaService;
  
  public static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  /**
   * 이미지 파일 업로드
   */
  async uploadImage(
    file: File,
    onProgress?: UploadProgressCallback,
    onComplete?: UploadCompleteCallback,
    onError?: UploadErrorCallback
  ): Promise<string> {
    if (!auth.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    // 파일 검증
    this.validateImageFile(file);

    const userId = auth.currentUser.uid;
    const fileId = uuidv4();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    
    // 스토리지 경로 생성
    const fileName = `${fileId}_${file.name}`;
    const storagePath = `users/${userId}/media/originals/${year}/${month}/${fileName}`;
    const storageRef = ref(storage, storagePath);

    try {
      // 메타데이터 사전 생성
      const metadata: Partial<MediaMetadata> = {
        id: fileId,
        userId,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadedAt: now,
        storagePath,
        processingStatus: 'pending',
        associations: {
          diaryIds: [],
          tags: []
        }
      };

      // Firestore에 메타데이터 저장 (pending 상태)
      await setDoc(doc(db, `media-${year}`, fileId), metadata);

      return new Promise((resolve, reject) => {
        // 업로드 시작
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type,
          customMetadata: {
            userId,
            fileId,
            originalName: file.name
          }
        });

        // 진행률 업데이트
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            onError?.(error);
            reject(error);
          },
          async () => {
            try {
              // 업로드 완료 - 다운로드 URL 획득
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // 메타데이터 업데이트
              const updatedMetadata: Partial<MediaMetadata> = {
                downloadURL,
                processingStatus: 'processing'
              };

              await setDoc(doc(db, `media-${year}`, fileId), updatedMetadata, { merge: true });

              // 이미지 처리는 Cloud Function이 자동으로 처리
              // 완료 콜백 호출 (아직 processing 상태)
              const completeMetadata = { ...metadata, downloadURL } as MediaMetadata;
              onComplete?.(completeMetadata);
              
              resolve(fileId);
            } catch (error) {
              console.error('Error getting download URL:', error);
              onError?.(error as Error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      onError?.(error as Error);
      throw error;
    }
  }

  /**
   * 파일 검증
   */
  private validateImageFile(file: File): void {
    // 파일 크기 검증 (100MB 제한)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error('파일 크기가 100MB를 초과합니다.');
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('지원하지 않는 파일 형식입니다. (JPEG, PNG, GIF, WebP, HEIC, HEIF만 지원)');
    }

    // 파일명 검증
    if (file.name.length > 200) {
      throw new Error('파일명이 너무 깁니다. (200자 이하)');
    }

    // 위험한 문자 검증
    const dangerousChars = /[<>:"/\\|?*]/;
    if (dangerousChars.test(file.name)) {
      throw new Error('파일명에 사용할 수 없는 문자가 포함되어 있습니다.');
    }
  }

  /**
   * 사용자의 미디어 목록 조회
   */
  async getUserMedia(userId: string, year?: number): Promise<MediaMetadata[]> {
    const currentYear = year || new Date().getFullYear();
    const mediaCollection = collection(db, `media-${currentYear}`);
    const q = query(mediaCollection, where('userId', '==', userId));
    
    try {
      const querySnapshot = await getDocs(q);
      const mediaList: MediaMetadata[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as MediaMetadata;
        // Firestore Timestamp를 Date로 변환
        if (data.uploadedAt && typeof data.uploadedAt !== 'string') {
          data.uploadedAt = (data.uploadedAt as any).toDate();
        }
        mediaList.push(data);
      });
      
      // 업로드 날짜 기준 내림차순 정렬
      return mediaList.sort((a, b) => 
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  }

  /**
   * 특정 미디어 메타데이터 조회
   */
  async getMediaMetadata(mediaId: string, year?: number): Promise<MediaMetadata | null> {
    const currentYear = year || new Date().getFullYear();
    
    try {
      const docSnap = await getDoc(doc(db, `media-${currentYear}`, mediaId));
      
      if (docSnap.exists()) {
        const data = docSnap.data() as MediaMetadata;
        // Firestore Timestamp를 Date로 변환
        if (data.uploadedAt && typeof data.uploadedAt !== 'string') {
          data.uploadedAt = (data.uploadedAt as any).toDate();
        }
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting media metadata:', error);
      throw error;
    }
  }

  /**
   * 미디어 파일 삭제
   */
  async deleteMedia(mediaId: string, year?: number): Promise<void> {
    if (!auth.currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    const currentYear = year || new Date().getFullYear();
    
    try {
      // 메타데이터 조회
      const metadata = await this.getMediaMetadata(mediaId, currentYear);
      if (!metadata) {
        throw new Error('미디어��� 찾을 수 없습니다.');
      }

      // 권한 확인
      if (metadata.userId !== auth.currentUser.uid) {
        throw new Error('삭제 권한이 없습니다.');
      }

      // Storage에서 파일들 삭제
      const filesToDelete = [
        metadata.storagePath, // 원본
        ...Object.values(metadata.thumbnails), // 썸네일들
        ...(metadata.compressed.webp ? [metadata.compressed.webp] : []),
        ...(metadata.compressed.jpeg ? [metadata.compressed.jpeg] : [])
      ];

      const deletePromises = filesToDelete.map(async (path) => {
        try {
          await deleteObject(ref(storage, path));
        } catch (error) {
          console.warn(`Failed to delete file: ${path}`, error);
        }
      });

      await Promise.all(deletePromises);

      // Firestore에서 메타데이터 삭제
      await deleteDoc(doc(db, `media-${currentYear}`, mediaId));

    } catch (error) {
      console.error('Error deleting media:', error);
      throw error;
    }
  }

  /**
   * 다중 파일 업로드
   */
  async uploadMultipleImages(
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void,
    onFileComplete?: (fileIndex: number, metadata: MediaMetadata) => void,
    onError?: (fileIndex: number, error: Error) => void
  ): Promise<string[]> {
    const uploadPromises = files.map((file, index) => 
      this.uploadImage(
        file,
        (progress) => onProgress?.(index, progress),
        (metadata) => onFileComplete?.(index, metadata),
        (error) => onError?.(index, error)
      )
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error in multiple upload:', error);
      throw error;
    }
  }

  /**
   * 미디어 검색
   */
  async searchMedia(
    userId: string,
    options: {
      query?: string;
      tags?: string[];
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
    }
  ): Promise<MediaMetadata[]> {
    // 현재는 기본 구현, 나중에 Algolia나 Firebase의 full-text search 연동 가능
    const currentYear = new Date().getFullYear();
    const allMedia = await this.getUserMedia(userId, currentYear);
    
    let filtered = allMedia;

    // 텍스트 검색
    if (options.query) {
      const query = options.query.toLowerCase();
      filtered = filtered.filter(media => 
        media.originalName.toLowerCase().includes(query) ||
        media.associations.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 태그 필터
    if (options.tags && options.tags.length > 0) {
      filtered = filtered.filter(media => 
        options.tags!.some(tag => media.associations.tags.includes(tag))
      );
    }

    // 날짜 범위 필터
    if (options.dateFrom) {
      filtered = filtered.filter(media => 
        new Date(media.uploadedAt) >= options.dateFrom!
      );
    }

    if (options.dateTo) {
      filtered = filtered.filter(media => 
        new Date(media.uploadedAt) <= options.dateTo!
      );
    }

    // 제한
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }
}

// 싱글톤 인스턴스 내보내기
export const mediaService = MediaService.getInstance();
