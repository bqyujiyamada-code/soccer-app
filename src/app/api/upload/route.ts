import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

// S3クライアントの初期化（.envから読み込み）
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();
    
    // S3内でのファイル名を生成（重複を避けるためにUUIDを付与）
    const fileKey = `uploads/${uuidv4()}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    // 60秒間だけ有効な「アップロード専用URL」を発行
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    return NextResponse.json({ signedUrl, fileKey });
  } catch (error) {
    console.error("S3 Presigned URL Error:", error);
    return NextResponse.json({ error: "アップロード用URLの生成に失敗しました" }, { status: 500 });
  }
}
