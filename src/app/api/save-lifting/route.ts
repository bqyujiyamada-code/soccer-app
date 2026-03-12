import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";

// 1. AWSとの接続窓口を作る
const client = new DynamoDBClient({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

// 2. 画面からデータが届いた時の処理
export async function POST(request: Request) {
  try {
    const { date, count, memo } = await request.json();

    const command = new PutCommand({
      TableName: "LiftingLogs", // DynamoDBで作ったテーブル名
      Item: {
        date: date,           // 日付
        count: Number(count), // 数値に変換
        memo: memo || "",      // メモ
        createdAt: new Date().toISOString(),
      },
    });

    await docClient.send(command);
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
