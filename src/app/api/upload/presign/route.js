import { NextResponse } from "next/server";
import { getS3Client } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export async function POST(request) {
  try {
    const s3 = getS3Client();
    if (!s3) {
      return NextResponse.json({ error: "S3/R2 client configuration is missing" }, { status: 500 });
    }

    const { filename, contentType } = await request.json();
    if (!filename || !contentType) {
      return NextResponse.json({ error: "Filename and contentType are required" }, { status: 400 });
    }

    // Extract file extension or default to webp
    const ext = filename.split(".").pop() || "webp";
    
    // Generate unique key inside items/ directory
    const uuid = randomUUID();
    const key = `items/${uuid}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // Generate presigned URL valid for 15 minutes (900 seconds)
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    const baseUrl = process.env.R2_PUBLIC_BASE_URL || "";
    const publicUrl = `${baseUrl.replace(/\/$/, "")}/${key}`;

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("Presign URL generation failed:", error);
    return NextResponse.json({ error: "Failed to generate presigned upload URL" }, { status: 500 });
  }
}
