import { NextResponse } from "next/server";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { docClient } from "@/lib/dynamodb";

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
  } catch (error) {
    console.error("DynamoDB Save Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const code = error && typeof error === "object" && "__type" in error
      ? (error as { __type?: string }).__type
      : undefined;
    return NextResponse.json(
      {
        error: "保存失敗",
        detail: message,
        code, // AWS特有のエラーコードを返す
      },
      { status: 500 }
    );
  }
}
