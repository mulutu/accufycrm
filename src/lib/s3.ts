import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadToS3(file: File, folder: string): Promise<string> {
  try {
    const buffer = await file.arrayBuffer();
    const key = `${folder}/${Date.now()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(buffer),
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Generate a signed URL that expires in 1 year
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 31536000 });

    return signedUrl;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
} 