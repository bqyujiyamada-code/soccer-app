"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getTrainingTierInfo } from "@/lib/trainingPricing";
import { TrainingLog, TrainingStats } from "@/lib/types";

const DAY_TYPE_ICON: Record<string, string> = {
  full: "🔥",
  partial: "⚡",
  none: "💤",
};

export default function TrainingHistory() {
  const [logs, setLogs] = useState<TrainingLog[]>([]);
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    Promise.all([
      fetch("/api/get-training").then((res) => res.json()),
      fetch("/api/get-training-stats").then((res) => res.json()),
    ])
      .then(([logsData, statsData]) => {
        setLogs(logsData);
        setStats(statsData);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredLogs = logs.filter((log) => log.date.startsWith(targetMonth));
  const monthlyTotal = filteredLogs.reduce((sum, log) => sum + (log.earnedMoney || 0), 0);
  const [, month] = targetMonth.split("-");
  const tierInfo = stats ? getTrainingTierInfo(Math.max(stats.streak, 1)) : null;

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-emerald-500 font-black animate-pulse text-2xl italic">LOADING HISTORY...🧘</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-4 pb-32 font-sans text-slate-100 overflow-x-hidden">
      <div className="w-full max-w-md mx-auto">

        {/* ストリークダッシュボード */}
        {stats && tierInfo && (
          <div className="bg-slate-800 rounded-3xl p-5 mb-6 border border-slate-700 shadow-2xl">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Streak</p>
                <h3 className="text-xl font-black text-orange-400 italic">{stats.streak}日<span className="text-xs text-slate-500 ml-2">(Best: {stats.longestStreak}日)</span></h3>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Price</p>
                <p className="text-xl font-black text-white">¥{tierInfo.price}</p>
              </div>
            </div>

            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
                style={{ width: `${tierInfo.progress}%` }}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 text-right uppercase tracking-tighter">
              {tierInfo.atMax ? "MAX単価に到達済み" : `Next Price: ¥${tierInfo.nextPrice} (あと ${tierInfo.daysUntilNextRaise}日)`}
            </p>
          </div>
        )}

        {/* 月切り替え & 月間合計 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex flex-col justify-center">
            <input
              type="month"
              value={targetMonth}
              onChange={(e) => setTargetMonth(e.target.value)}
              className="bg-transparent font-black text-emerald-400 outline-none text-sm cursor-pointer"
            />
          </div>
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-3 rounded-2xl shadow-lg border-b-4 border-emerald-800">
            <p className="text-[9px] font-black text-emerald-100 uppercase tracking-widest">{month}月 合計</p>
            <p className="text-2xl font-black text-white italic">¥{monthlyTotal.toLocaleString()}</p>
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
                  log.dayType === "full" ? "border-emerald-500" : log.dayType === "partial" ? "border-yellow-500" : "border-slate-600"
                }`}
              >
                <div className="flex-shrink-0 w-12 text-center border-r border-slate-700 mr-4">
                  <div className="text-[9px] font-black text-slate-500">{log.date.slice(5, 7)}/</div>
                  <div className="text-lg font-black text-white">{log.date.slice(8, 10)}</div>
                </div>

                <div className="flex-grow">
                  <div className="flex items-center gap-2 text-sm font-black text-white">
                    <span className={log.stretchDone ? "text-emerald-400" : "text-slate-600"}>🧘 ストレッチ</span>
                    <span className={log.practiceDone ? "text-emerald-400" : "text-slate-600"}>⚽️ 自主練</span>
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

                <div className="text-xl">{DAY_TYPE_ICON[log.dayType] || "⚽️"}</div>
              </div>
            ))
          )}
        </div>

        <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 pointer-events-none">
          <Link href="/training" className="pointer-events-auto bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-xl font-black shadow-2xl transition-all active:scale-95 flex items-center gap-2 italic uppercase tracking-tighter">
            + きろくする
          </Link>
        </div>
      </div>
    </div>
  );
}
