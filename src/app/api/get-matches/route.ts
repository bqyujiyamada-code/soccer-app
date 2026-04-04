import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
  try {
    const tableName = process.env.DYNAMODB_TABLE_NAME;

    if (!tableName) {
      throw new Error("DYNAMODB_TABLE_NAME が設定されていません");
    }

    // 全件取得（Scan）を実行
    const command = new ScanCommand({
      TableName: tableName,
    });

    const response = await docClient.send(command);

    // 日付の新しい順（降順）にソートして返す
    const sortedItems = (response.Items || []).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return NextResponse.json(sortedItems);
  } catch (error: any) {
    console.error("DynamoDB Fetch Error:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました", detail: error.message },
      { status: 500 }
    );
  }
}
