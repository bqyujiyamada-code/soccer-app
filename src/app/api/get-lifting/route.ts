import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { LIFTING_LOGS_TABLE } from "@/lib/constants";

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: LIFTING_LOGS_TABLE,
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
