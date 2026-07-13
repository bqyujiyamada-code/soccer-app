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
