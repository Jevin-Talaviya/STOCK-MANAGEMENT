import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

let s3ClientInstance = null;

export function getS3Client() {
  if (s3ClientInstance) return s3ClientInstance;

  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.warn("R2 credentials not fully defined. Storage actions might fail.");
    return null;
  }

  s3ClientInstance = new S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  return s3ClientInstance;
}

export async function deleteR2Object(publicUrl) {
  if (!publicUrl) return;

  const s3 = getS3Client();
  if (!s3) {
    console.warn("Cannot delete object. S3 Client not initialized.");
    return;
  }

  try {
    const urlObj = new URL(publicUrl);
    const key = decodeURIComponent(urlObj.pathname.slice(1));

    if (!key) return;

    await s3.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
    console.log(`Successfully deleted R2 object: ${key}`);
  } catch (error) {
    console.error(`Failed to delete R2 object for ${publicUrl}:`, error);
  }
}
