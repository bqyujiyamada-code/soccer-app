"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// --- 設定値・ロジック ---
const UNIT_PRICES = [
  { upTo: 1000, price: 0.3 },
  { upTo: 5000, price: 0.4 },
  { upTo: 999999, price: 0.5 },
];

const GET_TITLE = (totalCount: number) => {
  if (totalCount < 500) return "ルーキー候補生";
  if (totalCount < 1500) return "期待の新星";
  if (totalCount < 3000) return "チームの要";
  if (totalCount < 6000) return "エリアの騎士";
  return "伝説のファンタジスタ";
};

export default function LiftingEntry() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [count, setCount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  // 本来はDBから取得する値（仮定）
  const [userStats] = useState({
    bestCount: 120,
    totalCount: 2450,
    combo: 4,
    unpaidMoney: 350
  });

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
      {/* max-w-md と w-full を組み合わせ、box-borderを徹底 */}
      <div className="w-full max-w-md bg-slate-800 rounded-[2.5rem] shadow-2xl p-6 border-b-8 border-green-600 relative overflow-hidden box-border">
        
        <div className="absolute -top-10 -right-10 text-9xl opacity-10 rotate-12 pointer-events-none">⚽️</div>

        <header className="text-center mb-6">
          <div className="inline-block bg-green-500 text-slate-900 text-xs font-black px-3 py-1 rounded-full mb-2">
            {GET_TITLE(userStats.totalCount)}
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white">
            LIFTING <span className="text-green-500">QUEST</span>
          </h1>
        </header>

        {/* ステータスカード */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <div className="bg-slate-700/50 p-3 rounded-2xl text-center border border-slate-600">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Best</p>
            <p className="text-xl font-black text-green-400">{userStats.bestCount}</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-2xl text-center border border-slate-600">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Combo</p>
            <p className="text-xl font-black text-orange-400">{userStats.combo}d</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-2xl text-center border border-slate-600">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Level</p>
            <p className="text-xl font-black text-blue-400">¥{currentLevelPrice}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full box-border">
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-widest">Training Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              // box-border を明示し、widthを親に合わせる
              className="w-full box-border bg-slate-700 border-2 border-slate-600 rounded-2xl p-4 font-bold text-white outline-none focus:border-green-500 transition-all appearance-none"
            />
          </div>

          <div className="w-full">
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-widest">Max Count</label>
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
              <span className="absolute right-6 bottom-6 text-slate-400 font-black">回</span>
            </div>
            {isBestUpdate && (
              <p className="text-center text-orange-500 font-black text-sm mt-2">NEW RECORD!! +¥20</p>
            )}
          </div>

          <div className="w-full">
            <label className="block text-xs font-bold text-slate-400 mb-1 ml-1 uppercase tracking-widest">Training Memo</label>
            <textarea 
              value={memo} 
              onChange={(e) => setMemo(e.target.value)} 
              className="w-full box-border bg-slate-700 border-2 border-slate-600 rounded-2xl p-4 text-white focus:border-green-500 outline-none resize-none" 
              placeholder="気づいたこと（例：左足を中心にした）"
              rows={2}
            />
          </div>

          <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700 w-full box-border">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold">獲得予定報酬</span>
              <span className="text-2xl font-black text-white">
                <small className="text-sm mr-1 text-green-500">¥</small>
                {calculateReward()}
              </span>
            </div>
            {(userStats.combo + 1) % 5 === 0 && (
              <p className="text-[10px] text-orange-400 font-bold text-right mt-1">🔥 5日連続ボーナス適用中(1.5x)!</p>
            )}
          </div>

          <button 
            disabled={loading} 
            className="w-full py-5 bg-green-500 hover:bg-green-400 disabled:bg-slate-600 text-slate-900 rounded-2xl font-black text-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)] active:scale-95 transition-all uppercase italic"
          >
            {loading ? "Recording..." : "Finish Session"}
          </button>
        </form>

        <div className="mt-8 text-center">
           <Link href="/lifting/history" className="text-slate-500 font-bold hover:text-green-500 text-sm transition-colors">
              VIEW RECENT SESSIONS →
           </Link>
        </div>
      </div>
    </div>
  );
}
