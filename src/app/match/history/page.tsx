// src/app/match/history/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MatchHistory() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => { fetchMatches(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("この試合記録を削除してもよろしいですか？")) return;
    try {
      const res = await fetch(`/api/delete-match?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("削除しました");
        fetchMatches(); // リストを再取得
      }
    } catch (err) {
      alert("削除に失敗しました");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-24">
      {/* ヒーローヘッダー (省略) */}
      <div className="relative h-64 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <h1 className="text-5xl font-black italic tracking-tighter z-10">MATCH ARCHIVE</h1>
        <p className="text-blue-400 font-bold text-xs z-10 bg-blue-900/40 px-6 py-1.5 rounded-full border border-blue-500/30">SOCCER LOG</p>
      </div>

      <div className="max-w-2xl mx-auto -mt-10 px-4 space-y-8 relative z-20">
        <div className="space-y-6">
          {matches.map((match) => {
            const isWin = Number(match.scoreUs) > Number(match.scoreThem);
            return (
              <div key={match.id} className="bg-white text-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                {/* 編集・削除ボタン (ホバーで表示 or 常時) */}
                <div className="absolute top-4 right-4 z-30 flex gap-2">
                  <Link 
                    href={`/match/entry?id=${match.id}`}
                    className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <EditIcon />
                  </Link>
                  <button 
                    onClick={() => handleDelete(match.id)}
                    className="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg text-red-600 hover:bg-red-600 hover:text-white transition-all"
                  >
                    <TrashIcon />
                  </button>
                </div>

                {/* 画像エリア */}
                <div className="h-44 w-full relative">
                  <img src={match.images?.[0]?.url || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-6 flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full">{match.category || "U12"}</span>
                    <span className="text-white/80 text-[10px] font-bold tracking-widest">{match.matchType}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* ...以前のスコア表示レイアウト... */}
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-3 text-[10px] font-black text-slate-400">
                    <span>📅 {match.date}</span>
                    <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">🏆 {match.tournamentName}</span>
                  </div>
                  
                  {/* スコア部分は以前のものを流用、FC DENOVAを表示 */}
                  <div className="flex items-center justify-between gap-1 w-full px-2">
                    <div className="flex-1 text-center">
                      <p className="text-[9px] font-black text-slate-400 mb-1 tracking-tighter">OUR TEAM</p>
                      <p className="text-xs font-black text-blue-700">FC DENOVA</p>
                    </div>
                    <div className="flex flex-col items-center justify-center min-w-[100px]">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl font-black italic">{match.scoreUs}</span>
                        <span className="text-xl font-black text-slate-300">-</span>
                        <span className="text-4xl font-black italic">{match.scoreThem}</span>
                      </div>
                      <div className={`mt-2 text-[9px] font-black px-4 py-0.5 rounded-full ${isWin ? 'bg-orange-500 text-white' : 'bg-slate-200'}`}>
                        {isWin ? 'VICTORY' : 'RESULT'}
                      </div>
                    </div>
                    <div className="flex-1 text-center">
                      <p className="text-[9px] font-black text-slate-400 mb-1 uppercase">OPPONENT</p>
                      <p className="text-xs font-black truncate">{match.opponent}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <Link href="/match/entry" className="px-10 py-4 bg-blue-600 text-white rounded-full font-black text-xs tracking-widest shadow-2xl">ADD NEW MATCH</Link>
      </div>
    </div>
  );
}

// アイコンコンポーネント
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
