import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { LIFTING_LOGS_TABLE, LIFTING_STATS_TABLE, LIFTING_USER_ID } from "@/lib/constants";

/**
 * リフティング保存API
 * 1日1回の入力を想定（同じ日付は上書き）
 */
export async function POST(request: Request) {
  try {
    const { date, count, memo, earnedMoney, isBestUpdate } = await request.json();
    const numCount = Number(count);
    const timestamp = new Date().toISOString();

    // --- 1. 二重計上防止のための事前チェック ---
    // 今日すでにデータがあるか確認
    const getTodayLog = new GetCommand({
      TableName: LIFTING_LOGS_TABLE,
      Key: { date: date },
    });
    const todayLogRes = await docClient.send(getTodayLog);
    const prevLog = todayLogRes.Item;

    // --- 2. 累計ステータスの取得 ---
    const statsRes = await docClient.send(new GetCommand({
      TableName: LIFTING_STATS_TABLE,
      Key: { userId: LIFTING_USER_ID },
    }));
    const currentStats = statsRes.Item || {
      userId: LIFTING_USER_ID,
      totalCount: 0, 
      unpaidMoney: 0, 
      bestCount: 0, 
      combo: 0, 
      lastDate: "" 
    };

    // --- 3. 数値の差分調整 ---
    // 上書きの場合：(新しい値 - 古い値) を累計に加算する
    // 新規の場合：そのままの値を加算する
    const diffCount = prevLog ? (numCount - prevLog.count) : numCount;
    const diffMoney = prevLog ? (earnedMoney - prevLog.earnedMoney) : earnedMoney;

    // --- 4. コンボ計算 ---
    let nextCombo = currentStats.combo || 0;
    if (!prevLog) { // 新規保存の日だけコンボを判定
      if (currentStats.lastDate) {
        const lastDateObj = new Date(currentStats.lastDate);
        const todayObj = new Date(date);
        const diffTime = todayObj.getTime() - lastDateObj.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          nextCombo += 1;
        } else {
          nextCombo = 1;
        }
      } else {
        nextCombo = 1;
      }
    }

    // --- 5. LiftingLogs の保存（上書き） ---
    await docClient.send(new PutCommand({
      TableName: LIFTING_LOGS_TABLE,
      Item: {
        date: date, // Partition Key
        userId: LIFTING_USER_ID,
        count: numCount,
        memo: memo || "",
        earnedMoney: earnedMoney,
        isBestUpdate: isBestUpdate,
        status: "unpaid",
        createdAt: timestamp,
      },
    }));

    // --- 6. LiftingStats の更新 ---
    await docClient.send(new PutCommand({
      TableName: LIFTING_STATS_TABLE,
      Item: {
        ...currentStats,
        totalCount: currentStats.totalCount + diffCount,
        unpaidMoney: (currentStats.unpaidMoney || 0) + diffMoney,
        bestCount: isBestUpdate ? numCount : currentStats.bestCount,
        combo: nextCombo,
        lastDate: date,
        lastUpdated: timestamp,
      },
    }));

    return NextResponse.json({ 
      message: "Success", 
      newCombo: nextCombo,
      totalCount: currentStats.totalCount + diffCount 
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
