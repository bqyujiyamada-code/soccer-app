"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MatchHistory() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24">
      {/* --- ヒーローヘッダー --- */}
      <div className="relative h-72 bg-gradient-to-b from-blue-800 to-slate-900 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* 背景の装飾 */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-blue-500/10 blur-3xl rounded-full -translate-y-1/2"></div>
        
        <h1 className="text-5xl font-black italic tracking-tighter mb-2 z-10 drop-shadow-lg">
          MATCH ARCHIVE
        </h1>
        <p className="text-blue-400 font-bold tracking-[0.2em] text-xs z-10 bg-blue-900/40 px-4 py-1 rounded-full backdrop-blur-sm border border-blue-500/30">
          2026 SEASON LOG
        </p>
      </div>

      <div className="max-w-2xl mx-auto -mt-12 px-4 space-y-8 relative z-20">
        {/* --- 簡易スタッツ (息子さんの通算成績イメージ) --- */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "TOTAL GOALS", value: matches.reduce((acc, m) => acc + (Number(m.myGoals) || 0), 0) },
            { label: "ASSISTS", value: matches.reduce((acc, m) => acc + (Number(m.myAssists) || 0), 0) },
            { label: "MATCHES", value: matches.length }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl text-center shadow-xl">
              <p className="text-[9px] text-slate-500 font-black mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-blue-400">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* --- 試合リスト --- */}
        <div className="space-y-6">
          {matches.length === 0 ? (
            <div className="text-center py-24 bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-700">
              <p className="text-slate-500 font-bold tracking-widest">NO DATA FOUND</p>
              <Link href="/match/entry" className="text-blue-500 text-sm mt-4 inline-block font-bold hover:text-blue-400 transition-colors">
                最初の試合を記録する →
              </Link>
            </div>
          ) : (
            matches.map((match) => {
              const isWin = Number(match.scoreUs) > Number(match.scoreThem);
              return (
                <div key={match.id} className="bg-white text-slate-900 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform active:scale-[0.98]">
                  {/* 試合写真 */}
                  <div className="h-48 w-full relative group">
                    <img 
                      src={match.imageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80"} 
                      className="w-full h-full object-cover" 
                      alt="match" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                      {match.matchType || "MATCH"}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                      <span className="text-[11px] font-black text-slate-400 tracking-wider uppercase">
                        📅 {match.date}
                      </span>
                      <span className="text-[11px] font-black text-blue-600 tracking-wider uppercase bg-blue-50 px-3 py-1 rounded-lg">
                        🏆 {match.tournamentName || "PRACTICE"}
                      </span>
                    </div>

                    {/* スコアボード風表示 */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 text-center">
                        <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">OUR TEAM</p>
                        <p className="text-sm font-black truncate">息子さんのチーム</p>
                      </div>
                      
                      <div className="flex flex-col items-center px-4">
                        <div className="flex items-center gap-4">
                          <span className="text-5xl font-black italic tracking-tighter text-slate-900">{match.scoreUs}</span>
                          <span className="text-2xl font-black text-slate-300">-</span>
                          <span className="text-5xl font-black italic tracking-tighter text-slate-900">{match.scoreThem}</span>
                        </div>
                        <div className={`mt-2 text-[10px] font-black px-5 py-1 rounded-full shadow-sm ${isWin ? 'bg-orange-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {isWin ? 'VICTORY' : 'MATCH END'}
                        </div>
                      </div>

                      <div className="flex-1 text-center">
                        <p className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-tighter">OPPONENT</p>
                        <p className="text-sm font-black truncate">{match.opponent}</p>
                      </div>
                    </div>

                    {/* 息子さんの個人スタッツ */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
                        <span className="text-[9px] text-slate-400 font-black mb-1 uppercase">Goals</span>
                        <span className="text-2xl font-black text-orange-600 italic leading-none">⚽️ {match.myGoals || 0}</span>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col items-center">
                        <span className="text-[9px] text-slate-400 font-black mb-1 uppercase">Assists</span>
                        <span className="text-2xl font-black text-emerald-600 italic leading-none">👟 {match.myAssists || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* フローティングナビゲーション */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center bg-slate-800/90 backdrop-blur-2xl p-2 rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50">
        <Link 
          href="/match/entry" 
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-black text-xs tracking-widest shadow-xl hover:scale-105 transition-transform uppercase"
        >
          Add New Match
        </Link>
      </div>
    </div>
  );
}
