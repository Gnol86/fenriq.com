import { S3Client } from "@aws-sdk/client-s3";

// Configure S3 client
export const s3Client = new S3Client({
    region: process.env.AWS_S3_REGION,
    endpoint: process.env.AWS_S3_HOST,
    forcePathStyle: true, // Required for custom S3 endpoints
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
    },
});
