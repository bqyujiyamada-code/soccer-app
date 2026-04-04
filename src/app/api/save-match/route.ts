import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

export async function POST(request: Request) {
  try {
    const formData = await request.json();
    const tableName = process.env.DYNAMODB_TABLE_NAME;

    if (!tableName) {
      throw new Error("DYNAMODB_TABLE_NAME が設定されていません");
    }

    // 保存するデータの組み立て
    const item = {
      id: uuidv4(), // パーティションキー（DynamoDBの設定に合わせて変更してください）
      ...formData,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: tableName,
      Item: item,
    });

    await docClient.send(command);

    return NextResponse.json({ message: "Success" });
  } catch (error: any) {
    console.error("DynamoDB Save Error:", error);
    return NextResponse.json(
      { 
        error: "保存失敗", 
        detail: error.message,
        code: error.__type // AWS特有のエラーコードを返す
      }, 
      { status: 500 }
    );
  }
}
