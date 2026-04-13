import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";

const client = new DynamoDBClient({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const docClient = DynamoDBDocumentClient.from(client);

const USER_ID = "son_01"; // 固定ID

export async function GET() {
  try {
    const command = new GetCommand({
      TableName: "LiftingStats",
      Key: { userId: USER_ID },
    });
    const response = await docClient.send(command);
    
    // データがない場合（初回など）は0埋めの初期値を返す
    const stats = response.Item || {
      userId: USER_ID,
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
