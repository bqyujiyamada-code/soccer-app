import { NextResponse } from "next/server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/dynamodb";

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
  } catch (error) {
    console.error("DynamoDB Fetch Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "データの取得に失敗しました", detail: message },
      { status: 500 }
    );
  }
}
