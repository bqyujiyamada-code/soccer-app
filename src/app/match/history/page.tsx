// src/app/match/history/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MatchHistory() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/get-matches");
      if (!res.ok) throw new Error("データの取得に失敗しました");
      const data = await res.json();

      const sortedData = [...data].sort((a, b) => {
        if (a.date !== b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        const timeA = a.time || "00:00";
        const timeB = b.time || "00:00";
        return timeB.localeCompare(timeA);
      });

      setMatches(sortedData);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("この試合記録を削除しますか？")) return;
    try {
      const res = await fetch(`/api/delete-match?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("削除しました");
        fetchMatches();
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
      {/* ヒーローヘッダー */}
      <div className="relative h-64 bg-gradient-to-b from-blue-800 to-slate-900 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <h1 className="text-5xl font-black italic tracking-tighter mb-2 z-10 drop-shadow-lg text-white uppercase">
          Match Archive
        </h1>
        <p className="text-blue-400 font-bold tracking-[0.2em] text-[10px] z-10 bg-blue-900/40 px-6 py-1.5 rounded-full backdrop-blur-sm border border-blue-500/30 shadow-lg">
          SOCCER LOG SYSTEM
        </p>
      </div>

      <div className="max-w-2xl mx-auto -mt-10 px-4 space-y-8 relative z-20">
        {/* スタッツ */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "TOTAL GOALS", value: totalGoals, color: "text-orange-500" },
            { label: "ASSISTS", value: totalAssists, color: "text-emerald-500" },
            { label: "MATCHES", value: matches.length, color: "text-blue-400" }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl text-center shadow-xl">
              <p className="text-[9px] text-slate-500 font-black mb-1 tracking-wider uppercase">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color} leading-none`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 試合リスト */}
        <div className="space-y-6">
          {matches.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/30 rounded-[2rem] border border-dashed border-slate-700">
              <p className="text-slate-500 font-bold tracking-widest uppercase">No Data Found</p>
              <Link href="/match/entry" className="text-blue-500 text-sm mt-4 inline-block font-bold">記録を追加する →</Link>
            </div>
          ) : (
            matches.map((match) => {
              // --- 勝利判定ロジックの強化 ---
              const scoreUs = Number(match.scoreUs) || 0;
              const scoreThem = Number(match.scoreThem) || 0;
              const pkUs = Number(match.pkScoreUs) || 0;
              const pkThem = Number(match.pkScoreThem) || 0;
              
              // 通常スコアで勝っている、または同点でPK勝ちしている場合にVICTORY
              const isWin = scoreUs > scoreThem || (match.hasPK && scoreUs === scoreThem && pkUs > pkThem);

              const displayImageUrl = (match.images && match.images.length > 0) 
                ? match.images[0].url 
                : "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80";

              return (
                <div key={match.id} className="bg-white text-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative border border-white">
                  <div className="absolute top-4 right-4 z-30 flex gap-2">
                    <Link href={`/match/entry?id=${match.id}`} className="bg-white/90 p-2 rounded-full shadow-md text-blue-600 hover:bg-blue-600 hover:text-white transition-all w-8 h-8 flex items-center justify-center">
                      <span className="text-xs">✎</span>
                    </Link>
                    <button onClick={() => handleDelete(match.id)} className="bg-white/90 p-2 rounded-full shadow-md text-red-600 hover:bg-red-600 hover:text-white transition-all w-8 h-8 flex items-center justify-center">
                      <span className="text-xs">✕</span>
                    </button>
                  </div>

                  <div className="h-48 w-full relative">
                    <img src={displayImageUrl} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-6 flex items-center gap-2">
                      <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                        {match.category || "U12"}
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm text-white text-[9px] font-black px-3 py-1 rounded-full border border-white/30 uppercase">
                        {match.matchType || "MATCH"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col gap-1 mb-6 border-b border-slate-100 pb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black text-slate-400 tracking-tighter uppercase">
                          📅 {match.date} <span className="ml-1 text-slate-300">/</span> <span className="text-blue-500">{match.time || "09:00"}</span>
                        </span>
                        {match.matchStep && (
                          <span className="bg-orange-100 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded italic">
                            {match.matchStep}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-black text-slate-800 flex items-center gap-1 mt-1 uppercase">
                        <span className="text-blue-600">🏆</span> {match.tournamentName || "Practice Match"}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between gap-1 w-full px-2">
                      <div className="flex-1 text-center">
                        <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Our Team</p>
                        <p className="text-[11px] font-black text-blue-800 tracking-tighter leading-tight uppercase">FC Denova</p>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center min-w-[120px]">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl font-black italic text-slate-900 tracking-tighter">{match.scoreUs}</span>
                          <span className="text-xl font-black text-slate-200">-</span>
                          <span className="text-4xl font-black italic text-slate-900 tracking-tighter">{match.scoreThem}</span>
                        </div>
                        
                        {/* PK結果の表示 */}
                        {match.hasPK && (
                          <div className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-0.5 rounded-full mt-1 border border-blue-100">
                            PK {match.pkScoreUs} - {match.pkScoreThem}
                          </div>
                        )}

                        <div className={`mt-2 text-[9px] font-black px-4 py-0.5 rounded-full shadow-sm border ${isWin ? 'bg-orange-500 text-white border-orange-400' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          {isWin ? 'VICTORY' : 'RESULT'}
                        </div>
                      </div>

                      <div className="flex-1 text-center">
                        <p className="text-[9px] font-black text-slate-400 mb-1 uppercase tracking-tighter">Opponent</p>
                        <p className="text-[11px] font-black text-slate-800 truncate leading-tight uppercase">{match.opponent}</p>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="bg-orange-50/50 rounded-2xl p-4 border border-orange-100 flex flex-col items-center group hover:bg-orange-50 transition-colors">
                        <span className="text-[9px] text-orange-400 font-black mb-1 uppercase tracking-widest">Goals</span>
                        <span className="text-2xl font-black text-orange-600 italic">⚽️ {match.myGoals || 0}</span>
                      </div>
                      <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex flex-col items-center group hover:bg-emerald-50 transition-colors">
                        <span className="text-[9px] text-emerald-400 font-black mb-1 uppercase tracking-widest">Assists</span>
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

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Link href="/match/entry" className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-black text-[10px] tracking-[0.2em] shadow-[0_10px_30px_rgba(37,99,235,0.4)] active:scale-95 transition-all block text-center uppercase border border-blue-400">
          Add New Match
        </Link>
      </div>
    </div>
  );
}
