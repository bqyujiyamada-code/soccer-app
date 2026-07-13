import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { LIFTING_STATS_TABLE, LIFTING_USER_ID } from "@/lib/constants";

export async function GET() {
  try {
    const command = new GetCommand({
      TableName: LIFTING_STATS_TABLE,
      Key: { userId: LIFTING_USER_ID },
    });
    const response = await docClient.send(command);

    // データがない場合（初回など）は0埋めの初期値を返す
    const stats = response.Item || {
      userId: LIFTING_USER_ID,
      totalCount: 0,
      bestCount: 0,
      combo: 0,
      unpaidMoney: 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
