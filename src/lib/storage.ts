import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Storage type enum
export enum StorageType {
  LOCAL = 'local',
  S3 = 's3'
}

// Get storage type from environment variable, default to local
const STORAGE_TYPE = (process.env.STORAGE_TYPE as StorageType) || StorageType.LOCAL;

// Local storage configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

// S3 configuration
let s3Client: S3Client | null = null;

if (STORAGE_TYPE === StorageType.S3) {
  if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error('AWS_ACCESS_KEY_ID is not defined');
  }
  if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_SECRET_ACCESS_KEY is not defined');
  }
  if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION is not defined');
  }
  if (!process.env.AWS_BUCKET_NAME) {
    throw new Error('AWS_BUCKET_NAME is not defined');
  }

  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

// Type for file data that can come from both browser and Node.js
type FileData = {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export async function uploadFile(file: FileData, folder: string): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const fileName = `${Date.now()}-${file.name}`;
    const key = `${folder}/${fileName}`;

    if (STORAGE_TYPE === StorageType.LOCAL) {
      // Ensure upload directory exists
      const uploadPath = path.join(UPLOAD_DIR, folder);
      await mkdir(uploadPath, { recursive: true });

      // Write file to local filesystem
      const filePath = path.join(uploadPath, fileName);
      await writeFile(filePath, Buffer.from(buffer));

      // Return the public URL
      return `/uploads/${key}`;
    } else if (STORAGE_TYPE === StorageType.S3 && s3Client) {
      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: file.type,
      });

      await s3Client.send(command);

      // Generate a signed URL that expires in 1 hour
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return signedUrl;
    } else {
      throw new Error('Invalid storage configuration');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export function getFileUrl(path: string): string {
  if (path.startsWith('http')) {
    return path;
  }
  return `${process.env.NEXTAUTH_URL}${path}`;
} 