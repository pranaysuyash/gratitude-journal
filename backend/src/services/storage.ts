/**
 * Storage Service
 * AWS S3 or local file storage for media uploads
 * © 2024 Gratitude Journal. All Rights Reserved.
 */

import AWS from 'aws-sdk';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import logger from '../utils/logger';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'gratitude-journal-media';

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Express.Multer.File,
  folder: string = 'uploads'
): Promise<string> {
  try {
    const fileName = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const result = await s3.upload(params).promise();
    logger.info(`File uploaded to S3: ${result.Location}`);
    return result.Location;
  } catch (error) {
    logger.error('S3 upload error:', error);
    throw error;
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(fileUrl: string): Promise<void> {
  try {
    const key = fileUrl.split('/').slice(-2).join('/');

    await s3
      .deleteObject({
        Bucket: BUCKET_NAME,
        Key: key,
      })
      .promise();

    logger.info(`File deleted from S3: ${key}`);
  } catch (error) {
    logger.error('S3 delete error:', error);
    throw error;
  }
}

/**
 * Get signed URL for private file
 */
export async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: BUCKET_NAME,
      Key: key,
      Expires: expiresIn,
    });

    return url;
  } catch (error) {
    logger.error('Get signed URL error:', error);
    throw error;
  }
}

/**
 * Multer configuration for file uploads
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'));
    }
  },
});

/**
 * Upload media helper
 */
export async function uploadMedia(file: Express.Multer.File): Promise<{
  url: string;
  type: string;
  size: number;
  mimeType: string;
}> {
  try {
    const url = await uploadToS3(file, 'media');

    let type: 'image' | 'video' | 'audio' | 'drawing' = 'image';
    if (file.mimetype.startsWith('video/')) {
      type = 'video';
    } else if (file.mimetype.startsWith('audio/')) {
      type = 'audio';
    }

    return {
      url,
      type,
      size: file.size,
      mimeType: file.mimetype,
    };
  } catch (error) {
    logger.error('Upload media error:', error);
    throw error;
  }
}

/**
 * Generate thumbnail for image/video
 */
export async function generateThumbnail(fileUrl: string, type: string): Promise<string> {
  // TODO: Implement thumbnail generation using Sharp or FFmpeg
  logger.warn('Thumbnail generation not yet implemented');
  return fileUrl;
}
