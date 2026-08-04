import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { TRAINING_LOGS_TABLE } from "@/lib/constants";

export async function GET() {
  try {
    const command = new ScanCommand({
      TableName: TRAINING_LOGS_TABLE,
      // 1人運用ならScanで問題ありません。
    });

    const response = await docClient.send(command);

    const sortedItems = response.Items?.sort((a, b) => b.date.localeCompare(a.date)) || [];

    return NextResponse.json(sortedItems);
  } catch (error) {
    console.error("Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
