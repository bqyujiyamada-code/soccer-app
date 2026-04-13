import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";

const client = new DynamoDBClient({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const docClient = DynamoDBDocumentClient.from(client);
const USER_ID = "son_01";

export async function POST() {
  try {
    // 1. 未精算のログを全取得
    const scanCommand = new ScanCommand({
      TableName: "LiftingLogs",
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
        TableName: "LiftingLogs",
        Key: { date: item.date },
        UpdateExpression: "set #s = :paid",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":paid": "paid" },
      }));
    }

    // 3. Statsテーブルの未精算金額を0にする
    await docClient.send(new UpdateCommand({
      TableName: "LiftingStats",
      Key: { userId: USER_ID },
      UpdateExpression: "set unpaidMoney = :zero",
      ExpressionAttributeValues: { ":zero": 0 },
    }));

    return NextResponse.json({ success: true, count: Items.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "清算に失敗しました" }, { status: 500 });
  }
}
