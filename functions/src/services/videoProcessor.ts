// ME.STORY 비디오 처리 서비스
import * as admin from 'firebase-admin';
import * as ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// FFmpeg 바이너리 경로 설정
ffmpeg.setFfmpegPath(ffmpegStatic!);

const storage = admin.storage();
const bucket = storage.bucket();

// ============================================================================
// 타입 정의
// ============================================================================

interface VideoProcessingConfig {
  thumbnail: {
    width: number;
    height: number;
    timeOffset: string; // HH:MM:SS 형식
    format: 'jpg' | 'png' | 'webp';
    quality: number;
  };
  preview: {
    duration: number; // 초 단위
    width: number;
    height: number;
    bitrate: string;
    format: 'mp4' | 'webm';
  };
  analysis: {
    enableMetadata: boolean;
    enableFrameAnalysis: boolean;
  };
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
  codec: string;
  audioCodec?: string;
  fileSize: number;
}

interface VideoAnalysisResult {
  metadata: VideoMetadata;
  thumbnailPath: string;
  previewPath?: string;
  keyFrames?: string[];
}

// ============================================================================
// 설정
// ============================================================================

const DEFAULT_CONFIG: VideoProcessingConfig = {
  thumbnail: {
    width: 400,
    height: 300,
    timeOffset: '00:00:02', // 2초 지점
    format: 'jpg',
    quality: 80
  },
  preview: {
    duration: 10, // 10초 미리보기
    width: 640,
    height: 480,
    bitrate: '500k',
    format: 'mp4'
  },
  analysis: {
    enableMetadata: true,
    enableFrameAnalysis: false
  }
};

// ============================================================================
// 비디오 처리 클래스
// ============================================================================

class VideoProcessor {
  private config: VideoProcessingConfig;
  private tempDir: string;

  constructor(config: VideoProcessingConfig = DEFAULT_CONFIG) {
    this.config = config;
    this.tempDir = os.tmpdir();
  }

  // 메인 비디오 처리 함수
  async processVideo(bucketName: string, filePath: string): Promise<VideoAnalysisResult> {
    console.log(`Starting video processing: ${filePath}`);
    
    const tempVideoPath = path.join(this.tempDir, `video_${uuidv4()}.tmp`);
    
    try {
      // 원본 비디오 파일 다운로드
      const file = bucket.file(filePath);
      await file.download({ destination: tempVideoPath });
      
      // 비디오 메타데이터 추출
      const metadata = await this.extractMetadata(tempVideoPath);
      console.log(`Video metadata extracted: ${filePath}`);
      
      // 썸네일 생성
      const thumbnailPath = await this.generateThumbnail(filePath, tempVideoPath);
      console.log(`Video thumbnail generated: ${thumbnailPath}`);
      
      // 미리보기 비디오 생성 (선택적)
      let previewPath: string | undefined;
      if (metadata.duration > this.config.preview.duration) {
        previewPath = await this.generatePreview(filePath, tempVideoPath);
        console.log(`Video preview generated: ${previewPath}`);
      }
      
      return {
        metadata,
        thumbnailPath,
        previewPath
      };
    } catch (error) {
      console.error(`Video processing failed: ${filePath}`, error);
      throw error;
    } finally {
      // 임시 파일 정리
      this.cleanupTempFile(tempVideoPath);
    }
  }

  // 비디오 메타데이터 추출
  private async extractMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }

        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

        if (!videoStream) {
          reject(new Error('No video stream found'));
          return;
        }

        const result: VideoMetadata = {
          duration: metadata.format.duration || 0,
          width: videoStream.width || 0,
          height: videoStream.height || 0,
          frameRate: this.parseFrameRate(videoStream.r_frame_rate),
          bitrate: parseInt(metadata.format.bit_rate || '0'),
          codec: videoStream.codec_name || 'unknown',
          audioCodec: audioStream?.codec_name,
          fileSize: parseInt(metadata.format.size || '0')
        };

        resolve(result);
      });
    });
  }

  // 썸네일 생성
  private async generateThumbnail(originalPath: string, videoPath: string): Promise<string> {
    const thumbnailPath = this.getThumbnailPath(originalPath);
    const tempThumbnailPath = path.join(this.tempDir, `thumb_${uuidv4()}.${this.config.thumbnail.format}`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(this.config.thumbnail.timeOffset)
        .outputOptions([
          '-vframes 1',
          `-s ${this.config.thumbnail.width}x${this.config.thumbnail.height}`,
          `-q:v ${this.config.thumbnail.quality}`
        ])
        .output(tempThumbnailPath)
        .on('end', async () => {
          try {
            // 생성된 썸네일을 Storage에 업로드
            const thumbnailFile = bucket.file(thumbnailPath);
            await thumbnailFile.save(fs.readFileSync(tempThumbnailPath), {
              metadata: {
                contentType: `image/${this.config.thumbnail.format}`,
                cacheControl: 'public, max-age=31536000',
                metadata: {
                  originalPath,
                  type: 'video-thumbnail',
                  generatedAt: new Date().toISOString()
                }
              }
            });

            this.cleanupTempFile(tempThumbnailPath);
            resolve(thumbnailPath);
          } catch (error) {
            this.cleanupTempFile(tempThumbnailPath);
            reject(error);
          }
        })
        .on('error', (error) => {
          this.cleanupTempFile(tempThumbnailPath);
          reject(error);
        })
        .run();
    });
  }

  // 미리보기 비디오 생성
  private async generatePreview(originalPath: string, videoPath: string): Promise<string> {
    const previewPath = this.getPreviewPath(originalPath);
    const tempPreviewPath = path.join(this.tempDir, `preview_${uuidv4()}.${this.config.preview.format}`);

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .inputOptions([`-t ${this.config.preview.duration}`]) // 처음 N초만
        .outputOptions([
          `-s ${this.config.preview.width}x${this.config.preview.height}`,
          `-b:v ${this.config.preview.bitrate}`,
          '-movflags +faststart' // 웹 최적화
        ])
        .output(tempPreviewPath)
        .on('end', async () => {
          try {
            // 생성된 미리보기를 Storage에 업로드
            const previewFile = bucket.file(previewPath);
            await previewFile.save(fs.readFileSync(tempPreviewPath), {
              metadata: {
                contentType: `video/${this.config.preview.format}`,
                cacheControl: 'public, max-age=31536000',
                metadata: {
                  originalPath,
                  type: 'video-preview',
                  duration: this.config.preview.duration,
                  generatedAt: new Date().toISOString()
                }
              }
            });

            this.cleanupTempFile(tempPreviewPath);
            resolve(previewPath);
          } catch (error) {
            this.cleanupTempFile(tempPreviewPath);
            reject(error);
          }
        })
        .on('error', (error) => {
          this.cleanupTempFile(tempPreviewPath);
          reject(error);
        })
        .run();
    });
  }

  // 키 프레임 추출 (선택적 기능)
  async extractKeyFrames(videoPath: string, count: number = 5): Promise<string[]> {
    const keyFrames: string[] = [];
    const metadata = await this.extractMetadata(videoPath);
    const interval = Math.floor(metadata.duration / count);

    for (let i = 0; i < count; i++) {
      const timeOffset = i * interval;
      const framePath = path.join(this.tempDir, `frame_${i}_${uuidv4()}.jpg`);

      try {
        await this.extractFrame(videoPath, timeOffset, framePath);
        keyFrames.push(framePath);
      } catch (error) {
        console.warn(`Failed to extract frame at ${timeOffset}s:`, error);
      }
    }

    return keyFrames;
  }

  // 특정 시점의 프레임 추출
  private async extractFrame(videoPath: string, timeOffset: number, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .seekInput(timeOffset)
        .outputOptions(['-vframes 1'])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', reject)
        .run();
    });
  }

  // 비디오 압축 (고급 기능)
  async compressVideo(
    videoPath: string, 
    outputPath: string, 
    options: {
      bitrate?: string;
      resolution?: string;
      crf?: number; // Constant Rate Factor (품질 설정)
    } = {}
  ): Promise<void> {
    const {
      bitrate = '1000k',
      resolution = '1280x720',
      crf = 23
    } = options;

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .outputOptions([
          `-s ${resolution}`,
          `-crf ${crf}`,
          `-b:v ${bitrate}`,
          '-preset fast',
          '-movflags +faststart'
        ])
        .output(outputPath)
        .on('end', resolve)
        .on('error', reject)
        .on('progress', (progress) => {
          console.log(`Compression progress: ${progress.percent}%`);
        })
        .run();
    });
  }

  // 유틸리티 함수들
  private parseFrameRate(frameRateStr: string | undefined): number {
    if (!frameRateStr) return 0;
    
    const [numerator, denominator] = frameRateStr.split('/').map(Number);
    return denominator ? numerator / denominator : numerator || 0;
  }

  private getThumbnailPath(originalPath: string): string {
    const pathParts = originalPath.split('/');
    const fileName = pathParts.pop()!;
    const basePath = pathParts.join('/');
    
    const thumbnailBasePath = basePath.replace('/original/', '/thumbnails/');
    const fileNameWithoutExt = fileName.split('.')[0];
    
    return `${thumbnailBasePath}/${fileNameWithoutExt}_thumb.${this.config.thumbnail.format}`;
  }

  private getPreviewPath(originalPath: string): string {
    const pathParts = originalPath.split('/');
    const fileName = pathParts.pop()!;
    const basePath = pathParts.join('/');
    
    const previewBasePath = basePath.replace('/original/', '/compressed/');
    const fileNameWithoutExt = fileName.split('.')[0];
    
    return `${previewBasePath}/${fileNameWithoutExt}_preview.${this.config.preview.format}`;
  }

  private cleanupTempFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn(`Failed to cleanup temp file: ${filePath}`, error);
    }
  }

  // 비디오 유효성 검사
  static async validateVideo(filePath: string): Promise<boolean> {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          resolve(false);
          return;
        }

        const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
        
        // 기본 유효성 검사
        if (!videoStream || !metadata.format.duration) {
          resolve(false);
          return;
        }

        // 최소/최대 길이 제한 (1초 ~ 1시간)
        const duration = metadata.format.duration;
        if (duration < 1 || duration > 3600) {
          resolve(false);
          return;
        }

        resolve(true);
      });
    });
  }

  // 설정 업데이트
  updateConfig(newConfig: Partial<VideoProcessingConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// ============================================================================
// 내보내기
// ============================================================================

export const videoProcessor = new VideoProcessor();
export { VideoProcessor, VideoProcessingConfig, VideoMetadata, VideoAnalysisResult };
