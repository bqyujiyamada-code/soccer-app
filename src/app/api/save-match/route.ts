import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // ID生成ツール

const client = new DynamoDBClient({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const command = new PutCommand({
      TableName: "MatchResult",
      Item: {
        id: uuidv4(),             // 毎回違うIDを自動で作る
        date: data.date,          // 日付
        matchType: data.matchType, // 試合種別
        tournamentName: data.tournamentName, // 大会名
        matchStep: data.matchStep, // ステップ
        opponent: data.opponent,   // 対戦チーム
        scoreUs: Number(data.scoreUs),     // 自チーム得点
        scoreThem: Number(data.scoreThem), // 相手チーム得点
        hasPK: data.hasPK || false,        // PK戦があったか
        pkScoreUs: data.hasPK ? Number(data.pkScoreUs) : null,
        pkScoreThem: data.hasPK ? Number(data.pkScoreThem) : null,
        myGoals: Number(data.myGoals),     // 息子の得点
        myAssists: Number(data.myAssists), // 息子のアシスト
        createdAt: new Date().toISOString(),
      },
    });

    await docClient.send(command);
    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("DynamoDB Save Error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
