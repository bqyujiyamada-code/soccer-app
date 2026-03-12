"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function LiftingHistory() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 表示したい「年月」を管理する状態（初期値は現在の年月）
  const [targetMonth, setTargetMonth] = useState(new Date().toISOString().slice(0, 7)); // "2026-03"

  useEffect(() => {
    fetch("/api/get-lifting")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      });
  }, []);

  // 選択されている年月のデータだけを抽出
  const filteredLogs = logs.filter(log => log.date.startsWith(targetMonth));
  
  // その月の最高記録を計算
  const monthlyMax = filteredLogs.length > 0 
    ? Math.max(...filteredLogs.map(l => l.count)) 
    : 0;

  // 表示用の「YYYY年MM月」という文字列を作る
  const [year, month] = targetMonth.split("-");

  if (loading) return <div className="p-10 text-center font-bold">読み込み中...⚽️</div>;

  return (
    <div className="min-h-screen bg-green-50 p-4 pb-24 flex flex-col items-center">
      <div className="w-full max-w-md">
        
        {/* 月の選択切り替えUI */}
        <div className="flex justify-between items-center mb-6 bg-white p-2 rounded-2xl shadow-sm border-2 border-green-100">
          <input 
            type="month" 
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
            className="flex-grow p-2 bg-transparent font-bold text-green-700 outline-none"
          />
          <span className="pr-4 text-xs font-bold text-green-400">月をえらぶ</span>
        </div>

        {/* 🏆 表示中の月の最高記録セクション */}
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-6 shadow-lg mb-8 text-white text-center border-4 border-white relative overflow-hidden">
          <div className="relative z-10">
            {/* 動的なタイトル表示 */}
            <p className="font-bold text-sm tracking-widest mb-1">
              {year}年{month}月の最高記録
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-7xl font-black drop-shadow-md">{monthlyMax}</span>
              <span className="text-2xl font-bold">回</span>
            </div>
            <p className="mt-2 font-medium opacity-90">
              {monthlyMax > 0 ? "ナイスチャレンジ！🔥" : "きろくを付けてみよう！"}
            </p>
          </div>
          {/* 背景の薄い飾り */}
          <div className="absolute -right-4 -bottom-4 text-8xl opacity-20 grayscale">⚽️</div>
        </div>

        <h2 className="text-xl font-black text-green-800 mb-4 ml-2 flex items-center gap-2">
          <span>🗓️</span> きろくの履歴
        </h2>
        
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-3xl py-12 text-center text-gray-500 font-bold">
              この月のきろくはないよ
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.date} className="bg-white rounded-2xl p-4 shadow-sm flex items-center border-2 border-green-100 transition-transform active:scale-95">
                <div className="flex-shrink-0 w-16 text-center border-r-2 border-green-50 mr-4">
                  <div className="text-xs font-bold text-gray-400 uppercase">{log.date.slice(5, 7)}月</div>
                  <div className="text-2xl font-black text-green-600">{log.date.slice(8, 10)}</div>
                </div>
                <div className="flex-grow">
                  <div className="text-2xl font-black text-gray-800">
                    {log.count} <span className="text-sm font-bold text-gray-400">回</span>
                  </div>
                  {log.memo && <div className="text-sm text-gray-500 font-medium italic line-clamp-1">「{log.memo}」</div>}
                </div>
                {log.count >= monthlyMax && log.count > 0 && (
                  <div className="text-2xl animate-bounce">👑</div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 固定下部ボタン */}
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4 pointer-events-none">
          <Link href="/lifting" className="pointer-events-auto bg-green-600 hover:bg-green-500 text-white px-10 py-4 rounded-full font-black shadow-2xl transition-all active:scale-95 flex items-center gap-2 border-2 border-white">
            <span className="text-2xl">＋</span> きろくする
          </Link>
        </div>
      </div>
    </div>
  );
}
