"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LiftingHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7)); // "2026-04"

  useEffect(() => {
    fetch("/api/get-lifting")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

  // 選択月のデータを抽出
  const filteredLogs = logs.filter(log => log.date.startsWith(targetMonth));
  
  // その月の最高記録
  const monthlyMax = filteredLogs.length > 0 
    ? Math.max(...filteredLogs.map(l => l.count)) 
    : 0;

  const [year, month] = targetMonth.split("-");

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-green-500 font-black animate-pulse text-2xl italic">LOADING DATA...⚽️</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-4 pb-32 font-sans text-slate-100">
      <div className="w-full max-w-md mx-auto">
        
        {/* 月切り替えヘッダー */}
        <div className="flex justify-between items-center mb-6 bg-slate-800 p-3 rounded-2xl border border-slate-700 shadow-xl">
          <input 
            type="month" 
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="bg-transparent font-black text-green-400 outline-none text-lg cursor-pointer"
          />
          <div className="bg-slate-700 px-3 py-1 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-tighter">
            Month Select
          </div>
        </div>

        {/* 月間MVPカード */}
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-[2.5rem] p-6 shadow-2xl mb-8 border-b-4 border-green-900 relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-black text-[10px] tracking-[0.2em] text-green-200 uppercase mb-2">
              Monthly Best Record / {year}.{month}
            </p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-7xl font-black italic tracking-tighter text-white drop-shadow-lg">
                {monthlyMax}
              </span>
              <span className="text-xl font-black text-green-200 uppercase italic">times</span>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 text-9xl opacity-10 rotate-12">⚽️</div>
        </div>

        <h2 className="text-sm font-black text-slate-400 mb-4 ml-2 tracking-widest uppercase italic flex items-center gap-2">
          <span className="w-8 h-[2px] bg-green-500"></span> Training Logs
        </h2>
        
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="bg-slate-800 border-2 border-dashed border-slate-700 rounded-3xl py-16 text-center text-slate-500 font-bold italic">
              NO DATA FOR THIS MONTH
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log.date} 
                className={`bg-slate-800 rounded-3xl p-5 shadow-lg flex items-center border-l-4 transition-all active:scale-95 ${
                  log.isBestUpdate ? 'border-orange-500 bg-slate-800/80' : 'border-green-600'
                }`}
              >
                {/* 日付セクション */}
                <div className="flex-shrink-0 w-14 text-center border-r border-slate-700 mr-4">
                  <div className="text-[10px] font-black text-slate-500">{log.date.slice(5, 7)}月</div>
                  <div className="text-xl font-black text-white">{log.date.slice(8, 10)}</div>
                </div>

                {/* 内容セクション */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-black text-white italic">
                      {log.count} <span className="text-xs font-bold text-slate-500">回</span>
                    </div>
                    {log.isBestUpdate && (
                      <span className="bg-orange-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase">Best</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-green-500 font-black text-xs">
                      ¥{log.earnedMoney || 0}
                    </span>
                    {log.status === "paid" ? (
                      <span className="text-[8px] font-bold text-slate-500 border border-slate-700 px-1.5 rounded text-center">精算済</span>
                    ) : (
                      <span className="text-[8px] font-bold text-orange-400 border border-orange-900 px-1.5 rounded text-center animate-pulse">未精算</span>
                    )}
                  </div>
                  {log.memo && (
                    <div className="text-[10px] text-slate-400 font-medium mt-1 line-clamp-1 italic text-slate-500">
                      "{log.memo}"
                    </div>
                  )}
                </div>

                {/* 右端アイコン */}
                <div className="text-2xl">
                  {log.isBestUpdate ? "👑" : log.count >= 100 ? "🔥" : "⚽️"}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 下部固定ナビゲーション */}
        <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 pointer-events-none">
          <Link href="/lifting" className="pointer-events-auto bg-green-500 hover:bg-green-400 text-slate-900 px-10 py-4 rounded-2xl font-black shadow-[0_10px_30px_rgba(34,197,94,0.4)] transition-all active:scale-95 flex items-center gap-2 italic uppercase tracking-tighter">
            + New Session
          </Link>
        </div>
      </div>
    </div>
  );
}
