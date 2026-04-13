"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// Entry画面と共通のランク設定
const RANK_THRESHOLDS = [
  { threshold: 300, title: "ムードメーカー" },
  { threshold: 800, title: "期待のサブメンバー" },
  { threshold: 1500, title: "俊足のウイング" },
  { threshold: 2500, title: "不動のスタメン" },
  { threshold: 4000, title: "エリアの騎士" },
  { threshold: 6000, title: "絶対的司令塔" },
  { threshold: 8500, title: "伝説の10番" },
  { threshold: 12000, title: "ファンタジスタ" },
];

const GET_RANK_INFO = (total: number) => {
  const currentRank = [...RANK_THRESHOLDS].reverse().find(r => total >= r.threshold);
  const nextRank = RANK_THRESHOLDS.find(r => total < r.threshold);
  
  const currentTitle = currentRank ? currentRank.title : "テスト生";
  const nextTitle = nextRank ? nextRank.title : "極めし者";
  const nextThreshold = nextRank ? nextRank.threshold : total;
  const prevThreshold = currentRank ? currentRank.threshold : 0;
  
  const progress = nextRank 
    ? ((total - prevThreshold) / (nextThreshold - prevThreshold)) * 100 
    : 100;

  return { title: currentTitle, nextTitle, remaining: nextThreshold - total, progress: Math.min(progress, 100) };
};

export default function LiftingHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    // 履歴と統計の両方を取得
    Promise.all([
      fetch("/api/get-lifting").then(res => res.json()),
      fetch("/api/getlifting-stats").then(res => res.json())
    ]).then(([logsData, statsData]) => {
      setLogs(logsData);
      setStats(statsData);
      setLoading(false);
    }).catch(err => console.error(err));
  }, []);

  const filteredLogs = logs.filter(log => log.date.startsWith(targetMonth));
  const monthlyMax = filteredLogs.length > 0 ? Math.max(...filteredLogs.map(l => l.count)) : 0;
  const [year, month] = targetMonth.split("-");
  const rankInfo = stats ? GET_RANK_INFO(stats.totalCount) : null;

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-green-500 font-black animate-pulse text-2xl italic">LOADING HISTORY...⚽️</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-4 pb-32 font-sans text-slate-100 overflow-x-hidden">
      <div className="w-full max-w-md mx-auto">
        
        {/* 現在のランク・進捗ダッシュボード */}
        {rankInfo && (
          <div className="bg-slate-800 rounded-3xl p-5 mb-6 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Rank</p>
                <h3 className="text-xl font-black text-green-400 italic uppercase">{rankInfo.title}</h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Count</p>
                <p className="text-xl font-black text-white">{stats.totalCount.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000"
                style={{ width: `${rankInfo.progress}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 text-right uppercase tracking-tighter">
              Next: {rankInfo.nextTitle} (あと {rankInfo.remaining.toLocaleString()}回)
            </p>
          </div>
        )}

        {/* 月切り替え & 月間ベスト */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex flex-col justify-center">
            <input 
              type="month" 
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="bg-transparent font-black text-green-400 outline-none text-sm cursor-pointer"
            />
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-2xl shadow-lg border-b-4 border-green-800">
            <p className="text-[9px] font-black text-green-100 uppercase tracking-widest">{month}月 BEST</p>
            <p className="text-2xl font-black text-white italic">{monthlyMax}<small className="text-[10px] ml-1">回</small></p>
          </div>
        </div>

        <h2 className="text-xs font-black text-slate-500 mb-4 ml-2 tracking-[0.2em] uppercase italic flex items-center gap-2">
          <span className="w-6 h-[1px] bg-slate-700"></span> Training History
        </h2>
        
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-3xl py-12 text-center text-slate-600 font-bold italic text-sm">
              NO RECORDS FOUND
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.date} 
                className={`bg-slate-800 rounded-2xl p-4 shadow-md flex items-center border-l-4 transition-all ${
                  log.isBestUpdate ? 'border-orange-500 bg-slate-700/50' : 'border-slate-600'
                }`}
              >
                <div className="flex-shrink-0 w-12 text-center border-r border-slate-700 mr-4">
                  <div className="text-[9px] font-black text-slate-500">{log.date.slice(5, 7)}/</div>
                  <div className="text-lg font-black text-white">{log.date.slice(8, 10)}</div>
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-black text-white italic">
                      {log.count} <span className="text-[10px] font-bold text-slate-500">回</span>
                    </div>
                    {log.isBestUpdate && (
                      <span className="bg-orange-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">New Best</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-green-500 font-black text-[10px]">¥{log.earnedMoney || 0}</span>
                    <span className={`text-[8px] font-bold px-1.5 rounded border ${
                      log.status === "paid" ? "text-slate-500 border-slate-700" : "text-orange-400 border-orange-900/50"
                    }`}>
                      {log.status === "paid" ? "精算済" : "未精算"}
                    </span>
                  </div>
                </div>

                <div className="text-xl">
                  {log.isBestUpdate ? "👑" : log.count >= 100 ? "🔥" : "⚽️"}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 pointer-events-none">
          <Link href="/lifting" className="pointer-events-auto bg-green-500 hover:bg-green-400 text-slate-900 px-8 py-4 rounded-xl font-black shadow-2xl transition-all active:scale-95 flex items-center gap-2 italic uppercase tracking-tighter">
            + Start Session
          </Link>
        </div>
      </div>
    </div>
  );
}
