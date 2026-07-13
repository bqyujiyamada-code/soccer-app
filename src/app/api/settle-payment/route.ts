import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { LIFTING_LOGS_TABLE, LIFTING_STATS_TABLE, LIFTING_USER_ID } from "@/lib/constants";

export async function POST() {
  try {
    // 1. 未精算のログを全取得
    const scanCommand = new ScanCommand({
      TableName: LIFTING_LOGS_TABLE,
      FilterExpression: "#s <> :paid",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ":paid": "paid" },
    });
    const { Items } = await docClient.send(scanCommand);

    if (!Items || Items.length === 0) {
      return NextResponse.json({ message: "清算対象がありません" });
    }

    // 2. 各ログを「paid」に更新
    for (const item of Items) {
      await docClient.send(new UpdateCommand({
        TableName: LIFTING_LOGS_TABLE,
        Key: { date: item.date },
        UpdateExpression: "set #s = :paid",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":paid": "paid" },
      }));
    }

    // 3. Statsテーブルの未精算金額を0にする
    await docClient.send(new UpdateCommand({
      TableName: LIFTING_STATS_TABLE,
      Key: { userId: LIFTING_USER_ID },
      UpdateExpression: "set unpaidMoney = :zero",
      ExpressionAttributeValues: { ":zero": 0 },
    }));

    return NextResponse.json({ success: true, count: Items.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "清算に失敗しました" }, { status: 500 });
  }
}
