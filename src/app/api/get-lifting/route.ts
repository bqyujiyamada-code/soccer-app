import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";

const client = new DynamoDBClient({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const docClient = DynamoDBDocumentClient.from(client);

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: "LiftingLogs",
      // 1人運用ならScanで問題ありません。
      // もし将来的に家族全員分を入れるなら FilterExpression を追加します。
    });

    const response = await docClient.send(command);
    
    // 日付順（新しい順）にソートして、フロントエンドに返却
    const sortedItems = response.Items?.sort((a, b) => b.date.localeCompare(a.date)) || [];
    
    return NextResponse.json(sortedItems);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
