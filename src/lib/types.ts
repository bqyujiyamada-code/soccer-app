export interface MatchImage {
  key: string;
  url: string;
}

export interface Match {
  id: string;
  date: string;
  time: string;
  category: string;
  matchType: string;
  tournamentName: string;
  matchStep: string;
  opponent: string;
  scoreUs: number | string;
  scoreThem: number | string;
  hasPK: boolean;
  pkScoreUs: number | string;
  pkScoreThem: number | string;
  myGoals: number | string;
  myAssists: number | string;
  images: MatchImage[];
}

export interface LiftingLog {
  date: string;
  userId: string;
  count: number;
  memo: string;
  earnedMoney: number;
  isBestUpdate: boolean;
  status: "paid" | "unpaid";
  createdAt: string;
}

export interface LiftingStats {
  userId: string;
  totalCount: number;
  bestCount: number;
  combo: number;
  unpaidMoney: number;
  lastDate?: string;
  lastUpdated?: string;
}

export type TrainingDayType = "full" | "partial" | "none";

export interface TrainingLog {
  date: string;
  userId: string;
  stretchDone: boolean;
  practiceDone: boolean;
  dayType: TrainingDayType;
  streakDay: number; // dayType==="full"の日のみ意味を持つ連続日数(1始まり)。それ以外は0
  memo: string;
  earnedMoney: number;
  status: "paid" | "unpaid";
  createdAt: string;
}

export interface TrainingStats {
  userId: string;
  streak: number;
  longestStreak: number;
  unpaidMoney: number;
  lastDate?: string;
  lastDayType?: TrainingDayType;
  lastUpdated?: string;
}
