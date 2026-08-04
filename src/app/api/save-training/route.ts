import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { NextResponse } from "next/server";
import { docClient } from "@/lib/dynamodb";
import { TRAINING_LOGS_TABLE, TRAINING_STATS_TABLE, LIFTING_USER_ID } from "@/lib/constants";
import { computeEarnedMoney } from "@/lib/trainingPricing";
import type { TrainingDayType } from "@/lib/types";

/**
 * ストレッチ・自主練 保存API
 * 1日1回の入力を想定（同じ日付は上書き）。
 * 改ざん耐性のため、earnedMoneyと連続日数(streak)はクライアントの値を使わずサーバー側で計算する。
 */
export async function POST(request: Request) {
  try {
    const { date, stretchDone, practiceDone, memo } = await request.json();
    const timestamp = new Date().toISOString();

    const dayType: TrainingDayType =
      stretchDone && practiceDone ? "full" : stretchDone || practiceDone ? "partial" : "none";

    // --- 1. 二重計上防止のための事前チェック（同日再送＝上書き） ---
    const todayLogRes = await docClient.send(new GetCommand({
      TableName: TRAINING_LOGS_TABLE,
      Key: { date },
    }));
    const prevLog = todayLogRes.Item;

    // --- 2. 前日分のログを取得し、そこからstreakを算出する ---
    // stats.lastDate/lastDayTypeのような「最後に保存した日」ポインタに頼ると、
    // 同じ日を後から編集し直した際に誤った値のまま固定されてしまうため、
    // 常に「date-1日」のログを実際に見に行くことで、上書き編集でも正しく再計算できるようにする。
    const yesterday = new Date(`${date}T00:00:00Z`);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const yesterdayLogRes = await docClient.send(new GetCommand({
      TableName: TRAINING_LOGS_TABLE,
      Key: { date: yesterdayStr },
    }));
    const yesterdayLog = yesterdayLogRes.Item;

    let nextStreak: number;
    if (dayType === "full") {
      nextStreak = yesterdayLog?.dayType === "full" ? (yesterdayLog.streakDay || 0) + 1 : 1;
    } else {
      nextStreak = 0;
    }

    // --- 3. 金額計算（サーバー側で確定。クライアント値は使わない） ---
    const earnedMoney = computeEarnedMoney(dayType, nextStreak);
    const streakDay = dayType === "full" ? nextStreak : 0;

    // --- 4. 累計ステータスの取得 ---
    const statsRes = await docClient.send(new GetCommand({
      TableName: TRAINING_STATS_TABLE,
      Key: { userId: LIFTING_USER_ID },
    }));
    const currentStats = statsRes.Item || {
      userId: LIFTING_USER_ID,
      streak: 0,
      longestStreak: 0,
      unpaidMoney: 0,
    };

    // --- 5. 差分調整（上書きの場合：新しい値と古い値の差分だけ累計に反映） ---
    const diffMoney = prevLog ? earnedMoney - prevLog.earnedMoney : earnedMoney;

    // --- 6. TrainingLogs の保存（上書き） ---
    await docClient.send(new PutCommand({
      TableName: TRAINING_LOGS_TABLE,
      Item: {
        date,
        userId: LIFTING_USER_ID,
        stretchDone: !!stretchDone,
        practiceDone: !!practiceDone,
        dayType,
        streakDay,
        memo: memo || "",
        earnedMoney,
        status: "unpaid",
        createdAt: timestamp,
      },
    }));

    // --- 7. TrainingStats の更新 ---
    await docClient.send(new PutCommand({
      TableName: TRAINING_STATS_TABLE,
      Item: {
        ...currentStats,
        streak: nextStreak,
        longestStreak: Math.max(currentStats.longestStreak || 0, nextStreak),
        unpaidMoney: (currentStats.unpaidMoney || 0) + diffMoney,
        lastDate: date,
        lastDayType: dayType,
        lastUpdated: timestamp,
      },
    }));

    return NextResponse.json({
      message: "Success",
      dayType,
      earnedMoney,
      newStreak: nextStreak,
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
