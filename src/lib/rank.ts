const RANK_THRESHOLDS = [
  { threshold: 300, title: "ムードメーカー", color: "border-slate-500", bar: "from-slate-500 to-slate-300" },
  { threshold: 800, title: "期待のサブメンバー", color: "border-orange-400", bar: "from-orange-600 to-orange-400" },
  { threshold: 1500, title: "俊足のウイング", color: "border-blue-400", bar: "from-blue-600 to-blue-400" },
  { threshold: 2500, title: "不動のスタメン", color: "border-indigo-500", bar: "from-indigo-600 to-indigo-400" },
  { threshold: 4000, title: "エリアの騎士", color: "border-emerald-500", bar: "from-emerald-600 to-emerald-400" },
  { threshold: 6000, title: "絶対的司令塔", color: "border-purple-500", bar: "from-purple-600 to-purple-400" },
  { threshold: 8500, title: "伝説の10番", color: "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]", bar: "from-yellow-600 to-yellow-400" },
  { threshold: 12000, title: "ファンタジスタ", color: "border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.4)]", bar: "from-pink-600 to-pink-400" },
];

export function getRankInfo(total: number) {
  const currentRank = [...RANK_THRESHOLDS].reverse().find(r => total >= r.threshold);
  const nextRank = RANK_THRESHOLDS.find(r => total < r.threshold);

  const currentTitle = currentRank ? currentRank.title : "テスト生";
  const currentStyle = currentRank ? currentRank.color : "border-green-600";
  const currentBar = currentRank ? currentRank.bar : "from-green-600 to-green-400";

  const nextTitle = nextRank ? nextRank.title : "極めし者";
  const nextThreshold = nextRank ? nextRank.threshold : total;
  const prevThreshold = currentRank ? currentRank.threshold : 0;
  const progress = nextRank ? ((total - prevThreshold) / (nextThreshold - prevThreshold)) * 100 : 100;

  return {
    title: currentTitle,
    style: currentStyle,
    bar: currentBar,
    nextTitle,
    remaining: nextThreshold - total,
    progress: Math.min(progress, 100),
  };
}
