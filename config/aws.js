import { S3 } from '@aws-sdk/client-s3';  // Import the S3 client from v3
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS SDK with your credentials and region
const s3 = new S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default s3;
