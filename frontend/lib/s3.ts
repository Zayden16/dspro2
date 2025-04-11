import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type S3Config = {
  accessKey: string;
  secretKey: string;
  bucketName: string;
  region: string;
  endpoint?: string;
};

const getS3Config = (): S3Config => {
  const requiredEnvVars = [
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'S3_BUCKET_NAME',
    'S3_REGION'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Environment variable ${envVar} is required`);
    }
  }

  return {
    accessKey: process.env.S3_ACCESS_KEY as string,
    secretKey: process.env.S3_SECRET_KEY as string,
    bucketName: process.env.S3_BUCKET_NAME as string,
    region: process.env.S3_REGION as string,
    endpoint: process.env.S3_ENDPOINT
  };
};

const getS3Client = () => {
  const config = getS3Config();
  
  const clientOptions = {
    region: config.region,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
    },
  };

  if (config.endpoint) {
    return new S3Client({ 
      ...clientOptions,
      endpoint: config.endpoint,
      forcePathStyle: true
    });
  }

  return new S3Client(clientOptions);
};

export const uploadImage = async (
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  const config = getS3Config();
  const s3Client = getS3Client();
  
  const key = `images/${Date.now()}-${fileName}`;
  
  await s3Client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: new Uint8Array(file),
      ContentType: contentType,
    })
  );
  
  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
    { expiresIn: 60 * 60 * 24 * 7 } // URL expires in 7 days
  );
  
  return url;
};

export const getImageUrl = async (key: string): Promise<string> => {
  const config = getS3Config();
  const s3Client = getS3Client();
  
  const url = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
    { expiresIn: 60 * 60 * 24 * 7 } // URL expires in 7 days
  );
  
  return url;
};

export const deleteImage = async (key: string): Promise<void> => {
  const config = getS3Config();
  const s3Client = getS3Client();
  
  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    })
  );
};

export const listImages = async (prefix: string = 'images/'): Promise<string[]> => {
  const config = getS3Config();
  const s3Client = getS3Client();
  
  const response = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: config.bucketName,
      Prefix: prefix,
    })
  );
  
  return (response.Contents || []).map(item => item.Key || '').filter(Boolean);
};
