import type { TrainingDayType } from "./types";

// 「両方揃った日」の連続日数(streakDay, 1始まり)に応じて1日あたりの単価を決める。
// 7日ごとに+10円、上限70円。毎日フル達成し続けた場合の月合計が概ね1500円(30日:1440円/31日:1510円)に収まる設計。
export const BASE_PRICE = 30;
export const STEP_AMOUNT = 10;
export const STEP_DAYS = 7;
export const MAX_PRICE = 70;

// 「片方だけ」の日の固定報酬（BASE_PRICEの半額）。連続はリセットされる。
export const PARTIAL_PRICE = 15;

export function fullDayPrice(streakDay: number): number {
  if (streakDay <= 0) return 0;
  return Math.min(BASE_PRICE + STEP_AMOUNT * Math.floor((streakDay - 1) / STEP_DAYS), MAX_PRICE);
}

export function computeEarnedMoney(dayType: TrainingDayType, streakDayIfFull: number): number {
  if (dayType === "full") return fullDayPrice(streakDayIfFull);
  if (dayType === "partial") return PARTIAL_PRICE;
  return 0;
}

// 記録画面・履歴画面の進捗表示用。streakDayには「表示したい日」の連続日数を渡す
// （例: 今日達成した場合の見込みを出すなら currentStreak + 1）。
export function getTrainingTierInfo(streakDay: number) {
  const day = Math.max(streakDay, 1);
  const price = fullDayPrice(day);
  const atMax = price >= MAX_PRICE;

  const tierStart = Math.floor((day - 1) / STEP_DAYS) * STEP_DAYS + 1;
  const nextTierStart = tierStart + STEP_DAYS;
  const nextPrice = atMax ? MAX_PRICE : fullDayPrice(nextTierStart);
  const daysUntilNextRaise = atMax ? 0 : nextTierStart - day;
  const progress = atMax ? 100 : ((day - tierStart + 1) / STEP_DAYS) * 100;

  return {
    price,
    nextPrice,
    daysUntilNextRaise,
    progress: Math.min(progress, 100),
    atMax,
  };
}
