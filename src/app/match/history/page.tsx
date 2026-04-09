// src/app/match/history/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MatchHistory() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // データの取得ロジックを関数化（削除後にも再利用するため）
  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/get-matches");
      if (!res.ok) throw new Error("データの取得に失敗しました");
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // 削除処理
  const handleDelete = async (id: string) => {
    if (!confirm("この試合記録を削除しますか？")) return;
    try {
      const res = await fetch(`/api/delete-match?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("削除しました");
        fetchMatches(); // リストを更新
      } else {
        alert("削除に失敗しました");
      }
    } catch (err) {
      alert("通信エラーが発生しました");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const totalGoals = matches.reduce((acc, m) => acc + (Number(m.myGoals) || 0), 0);
  const totalAssists = matches.reduce((acc, m) => acc + (Number(m.myAssists) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24">
      {/* --- ヒーローヘッダー --- */}
      <div className="relative h-64 bg-gradient-to-b from-blue-800 to-slate-900 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <h1 className="text-5xl font-black italic tracking-tighter mb-2 z-10 drop-shadow-lg">
          MATCH ARCHIVE
        </h1>
        <p className="text-blue-400 font-bold tracking-[0.2em] text-xs z-10 bg-blue-900/40 px-6 py-1.5 rounded-full backdrop-blur-sm border border-blue-500/30 shadow-lg">
          SOCCER LOG
        </p>
      </div>

      <div className="max-w-2xl mx-auto -mt-10 px-4 space-y-8 relative z-20">
        {/* --- スタッツ --- */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "TOTAL GOALS", value: totalGoals },
            { label: "ASSISTS", value: totalAssists },
            { label: "MATCHES", value: matches.length }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl text-center shadow-xl">
              <p className="text-[9px] text-slate-500 font-black mb-1 tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-blue-400 leading-none">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* --- 試合リスト --- */}
        <div className="space-y-6">
          {matches.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-700">
              <p className="text-slate-500 font-bold tracking-widest">NO DATA FOUND</p>
              <Link href="/match/entry" className="text-blue-500 text-sm mt-4 inline-block font-bold">
                最初の試合を記録する →
              </Link>
            </div>
          ) : (
            matches.map((match) => {
              const isWin = Number(match.scoreUs) > Number(match.scoreThem);
              const displayImageUrl = (match.images && match.images.length > 0) 
                ? match.images[0].url 
                : "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80";

              return (
                <div key={match.id} className="bg-white text-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative">
                  
                  {/* --- 操作ボタン (編集・削除) --- */}
                  <div className="absolute top-4 right-4 z-30 flex gap-2">
                    <Link 
                      href={`/match/entry?id=${match.id}`} 
                      className="bg-white/90 p-2 rounded-full shadow-md text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center w-8 h-8"
                      title="編集"
                    >
                      <span className="text-sm">✎</span>
                    </Link>
                    <button 
                      onClick={() => handleDelete(match.id)} 
                      className="bg-white/90 p-2 rounded-full shadow-md text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center w-8 h-8"
                      title="削除"
                    >
                      <span className="text-sm">✕</span>
                    </button>
                  </div>

                  {/* 画像エリア */}
                  <div className="h-44 w-full relative">
                    <img src={displayImageUrl} className="w-full h-full object-cover" alt="match scene" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-6 flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                        {match.category || "U12"}
                      </span>
                      <span className="text-white/80 text-[10px] font-bold">
                        {match.matchType || "MATCH"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-black text-slate-400 tracking-tight uppercase">
                        📅 {match.date}
                      </span>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg max-w-[150px] truncate">
                        🏆 {match.tournamentName || "PRACTICE"}
                      </span>
                    </div>

                    {/* スコア表示 */}
                    <div className="flex items-center justify-between gap-1 w-full px-2">
                      <div className="flex-1 text-center">
                        <p className="text-[9px] font-black text-slate-400 mb-1">OUR TEAM</p>
                        <p className="text-xs font-black text-blue-700 tracking-tighter">FC DENOVA</p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center min-w-[100px]">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl font-black italic text-slate-900">{match.scoreUs}</span>
                          <span className="text-xl font-black text-slate-300">-</span>
                          <span className="text-4xl font-black italic text-slate-900">{match.scoreThem}</span>
                        </div>
                        <div className={`mt-2 text-[9px] font-black px-4 py-0.5 rounded-full shadow-sm ${isWin ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {isWin ? 'VICTORY' : 'RESULT'}
                        </div>
                      </div>

                      <div className="flex-1 text-center">
                        <p className="text-[9px] font-black text-slate-400 mb-1 uppercase">OPPONENT</p>
                        <p className="text-xs font-black text-slate-800 truncate">{match.opponent}</p>
                      </div>
                    </div>

                    {/* 個人スタッツ */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
                        <span className="text-[9px] text-slate-400 font-black mb-1 uppercase">Goals</span>
                        <span className="text-2xl font-black text-orange-600 italic">⚽️ {match.myGoals || 0}</span>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
                        <span className="text-[9px] text-slate-400 font-black mb-1 uppercase">Assists</span>
                        <span className="text-2xl font-black text-emerald-600 italic">👟 {match.myAssists || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* フローティングボタン */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Link 
          href="/match/entry" 
          className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-black text-xs tracking-widest shadow-2xl active:scale-95 transition-transform block text-center"
        >
          ADD NEW MATCH
        </Link>
      </div>
    </div>
  );
}
