import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// AWSクライアントの初期化（環境変数が空ならエラーを吐くように設定）
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();
    
    // バケット名が取得できているかチェック
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("AWS_S3_BUCKET_NAME が設定されていません");
    }

    const fileKey = `uploads/${uuidv4()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return NextResponse.json({ signedUrl, fileKey });
  } catch (error: any) {
    console.error("S3 Presigned URL Error:", error);
    return NextResponse.json(
      { error: "URL生成失敗", detail: error.message }, 
      { status: 500 }
    );
  }
}
