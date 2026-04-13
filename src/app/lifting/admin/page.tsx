"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSettle() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/getlifting-stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  const handleSettle = async () => {
    if (!confirm(`¥${stats.unpaidMoney} を清算してよろしいですか？`)) return;
    
    setSettling(true);
    try {
      const res = await fetch("/api/settle-payment", { method: "POST" });
      if (res.ok) {
        alert("清算完了！お疲れ様でした！⚽️");
        router.push("/lifting/history");
      }
    } catch (err) {
      alert("エラーが発生しました");
    } finally {
      setSettling(false);
    }
  };

  if (loading) return <div className="p-10 text-white text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-6 flex flex-col items-center justify-center font-sans text-white">
      <div className="w-full max-w-sm bg-slate-800 rounded-[3rem] p-8 border-t-8 border-yellow-500 shadow-2xl text-center relative overflow-hidden">
        
        <div className="absolute -right-4 -top-4 text-8xl opacity-10">💰</div>

        <h1 className="text-xl font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Payment Center</h1>
        <p className="text-sm text-slate-500 font-bold mb-8 italic">今回のトレーニング報酬を精算します</p>

        <div className="mb-10">
          <p className="text-xs font-black text-yellow-500 uppercase mb-1">Total Unpaid Amount</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-black text-slate-400 mt-4">¥</span>
            <span className="text-7xl font-black italic tracking-tighter text-white">
              {stats?.unpaidMoney?.toLocaleString() || 0}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSettle}
            disabled={settling || stats?.unpaidMoney === 0}
            className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 uppercase italic"
          >
            {settling ? "Settling..." : "Settle Now (清算実行)"}
          </button>
          
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-transparent border-2 border-slate-700 text-slate-500 rounded-2xl font-bold text-sm hover:bg-slate-700 transition-all"
          >
            戻る
          </button>
        </div>

        <div className="mt-8 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            ※ボタンを押すと、すべての履歴が「精算済」になります。<br/>
            現金またはお小遣い帳への記入を忘れずに！
          </p>
        </div>
      </div>
    </div>
  );
}
