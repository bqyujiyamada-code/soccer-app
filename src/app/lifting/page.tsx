"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const UNIT_PRICES = [
  { upTo: 1000, price: 0.3 },
  { upTo: 5000, price: 0.4 },
  { upTo: 999999, price: 0.5 },
];

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
  const progress = nextRank ? ((total - prevThreshold) / (nextThreshold - prevThreshold)) * 100 : 100;

  return { title: currentTitle, nextTitle, remaining: nextThreshold - total, progress: Math.min(progress, 100) };
};

export default function LiftingEntry() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [count, setCount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [userStats, setUserStats] = useState({
    bestCount: 0,
    totalCount: 0,
    combo: 0,
    unpaidMoney: 0
  });

  useEffect(() => {
    fetch("/api/get-lifting-stats")
      .then(res => res.json())
      .then(data => setUserStats(data))
      .catch(err => console.error("Stats fetch error:", err));
  }, []);

  const rankInfo = GET_RANK_INFO(userStats.totalCount);
  const currentLevelPrice = UNIT_PRICES.find(p => userStats.totalCount <= p.upTo)?.price || 0.3;
  const isBestUpdate = Number(count) > userStats.bestCount;
  
  const calculateReward = () => {
    const n = Number(count);
    if (!n || n <= 0) return 0;
    let reward = 10; 
    reward += n * currentLevelPrice; 
    if (isBestUpdate) reward += 20; 
    if ((userStats.combo + 1) % 5 === 0) reward *= 1.5; 
    return Math.floor(reward);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/save-lifting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          date, 
          count: Number(count), 
          memo,
          earnedMoney: calculateReward(),
          isBestUpdate
        }),
      });

      if (res.ok) {
        alert(isBestUpdate ? "🎊 自己ベスト更新！おめでとう！ 🎊" : "ナイスリフティング！保存したよ！⚽️");
        router.push("/lifting/history");
      } else {
        throw new Error();
      }
    } catch (err) {
      alert("エラーがおきちゃった！もう一度試してみてね。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 flex items-center justify-center font-sans text-slate-100 overflow-x-hidden">
      <div className="w-full max-w-md bg-slate-800 rounded-[2.5rem] shadow-2xl p-6 border-b-8 border-green-600 relative overflow-hidden box-border">
        
        <div className="absolute -top-10 -right-10 text-9xl opacity-10 rotate-12 pointer-events-none">⚽️</div>

        <header className="text-center mb-6">
          <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em] mb-1">Current Rank</p>
          {/* 称号を大きく強調 */}
          <h2 className="text-2xl font-black text-white bg-slate-700/50 inline-block px-6 py-2 rounded-2xl border border-slate-600 shadow-xl italic mb-4">
            {rankInfo.title}
          </h2>
          <h1 className="text-sm font-black italic tracking-widest text-slate-500 block">
            LIFTING <span className="text-green-500 text-lg">QUEST</span>
          </h1>
        </header>

        {/* ランクアップ進捗 */}
        <div className="mb-6 bg-slate-900/40 p-3 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
            <span>Next: {rankInfo.nextTitle}</span>
            <span className="text-green-500">あと {rankInfo.remaining.toLocaleString()}回</span>
          </div>
          <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
            <div 
              className="h-full bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)] transition-all duration-1000 ease-out"
              style={{ width: `${rankInfo.progress}%` }}
            />
          </div>
        </div>

        {/* ステータスカード */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <div className="bg-slate-700/50 p-3 rounded-2xl text-center border border-slate-600 shadow-inner">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Best</p>
            <p className="text-xl font-black text-green-400">{userStats.bestCount}</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-2xl text-center border border-slate-600 shadow-inner">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Combo</p>
            {/* 〇日表記に変更 */}
            <p className="text-xl font-black text-orange-400">{userStats.combo}<span className="text-xs ml-0.5">日</span></p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-2xl text-center border border-slate-600 shadow-inner">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Price</p>
            <p className="text-lg font-black text-blue-400">¥{currentLevelPrice}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full box-border">
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase tracking-widest">Training Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full box-border bg-slate-700 border-2 border-slate-600 rounded-2xl p-4 font-bold text-white outline-none focus:border-green-500 transition-all appearance-none"
            />
          </div>

          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase tracking-widest">Max Count</label>
            <div className="relative w-full box-border">
              <input 
                type="number" 
                inputMode="numeric"
                placeholder="0"
                value={count} 
                onChange={(e) => setCount(e.target.value)} 
                className={`w-full box-border bg-slate-700 border-4 ${isBestUpdate ? 'border-orange-500 animate-pulse' : 'border-slate-600'} rounded-3xl p-8 text-6xl text-center font-black outline-none focus:border-green-500 transition-all text-white`}
                required 
              />
              <span className="absolute right-6 bottom-6 text-slate-400 font-black italic">回</span>
            </div>
            {isBestUpdate && (
              <p className="text-center text-orange-500 font-black text-sm mt-2 animate-bounce">NEW RECORD!! +¥20</p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase tracking-widest">Training Memo</label>
            <textarea 
              value={memo} 
              onChange={(e) => setMemo(e.target.value)} 
              className="w-full box-border bg-slate-700 border-2 border-slate-600 rounded-2xl p-4 text-white focus:border-green-500 outline-none resize-none text-sm" 
              placeholder="今日の気づきは？"
              rows={2}
            />
          </div>

          {/* 未精算のおこづかい合計を表示 */}
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700 w-full box-border relative">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-tight">未精算のおこづかい</span>
              <span className="text-3xl font-black text-white italic text-right">
                <small className="text-sm mr-1 text-green-500 not-italic">¥</small>
                {userStats.unpaidMoney.toLocaleString()}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold text-right mt-1 uppercase tracking-tight">
              ※今回の獲得予定: +¥{calculateReward()}
            </p>
          </div>

          <button 
            disabled={loading} 
            className="w-full py-5 bg-green-500 hover:bg-green-400 disabled:bg-slate-600 text-slate-900 rounded-2xl font-black text-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-95 transition-all uppercase italic tracking-tighter"
          >
            {loading ? "Recording..." : "Finish Session"}
          </button>
        </form>

        <div className="mt-8 text-center flex justify-between items-center px-2">
           <Link href="/lifting/history" className="text-slate-500 font-bold hover:text-green-500 text-[10px] transition-colors tracking-widest uppercase">
              History →
           </Link>
           <Link href="/lifting/admin" className="text-slate-700 font-bold hover:text-yellow-600 text-[10px] transition-colors tracking-widest uppercase">
              Admin (清算)
           </Link>
        </div>
      </div>
    </div>
  );
}
