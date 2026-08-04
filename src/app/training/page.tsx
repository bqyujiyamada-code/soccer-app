"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { computeEarnedMoney, getTrainingTierInfo } from "@/lib/trainingPricing";
import type { TrainingDayType } from "@/lib/types";

export default function TrainingEntry() {
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [stretchDone, setStretchDone] = useState(false);
  const [practiceDone, setPracticeDone] = useState(false);
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    streak: 0,
    longestStreak: 0,
    unpaidMoney: 0,
  });

  useEffect(() => {
    fetch("/api/get-training-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Stats fetch error:", err));
  }, []);

  const dayType: TrainingDayType =
    stretchDone && practiceDone ? "full" : stretchDone || practiceDone ? "partial" : "none";

  // 実際の値は保存時にサーバー側で確定する。ここでは「連続が続いた場合」を仮定した見込み表示。
  const previewStreakDay = stats.streak + 1;
  const previewMoney = computeEarnedMoney(dayType, previewStreakDay);
  const tierInfo = getTrainingTierInfo(previewStreakDay);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/save-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, stretchDone, practiceDone, memo }),
      });

      if (res.ok) {
        const messages: Record<TrainingDayType, string> = {
          full: "🎉 ストレッチも自主練もバッチリ！記録したよ！",
          partial: "ナイス！半分できたね。記録したよ！",
          none: "今日はお休みだね。また明日がんばろう！",
        };
        alert(messages[dayType]);
        router.push("/training/history");
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
      <div className="w-full max-w-md bg-slate-800 rounded-[2.5rem] p-6 border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden box-border transition-all duration-700">

        <div className="absolute -top-10 -right-10 text-9xl opacity-10 rotate-12 pointer-events-none">🧘</div>

        <header className="text-center mb-6">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Daily Check</p>
          <h1 className="text-sm font-black italic tracking-widest text-slate-500 block">
            TRAINING <span className="text-emerald-500 text-lg uppercase">Quest</span>
          </h1>
        </header>

        {/* 単価アップ進捗バー */}
        <div className="mb-6 bg-slate-900/40 p-3 rounded-2xl border border-slate-700/50">
          <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">
            <span>{tierInfo.atMax ? "MAX単価達成中" : `Next Price: ¥${tierInfo.nextPrice}`}</span>
            <span className="text-white">
              {tierInfo.atMax ? "🏆" : `あと ${tierInfo.daysUntilNextRaise}日`}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 ease-out"
              style={{ width: `${tierInfo.progress}%` }}
            />
          </div>
        </div>

        {/* ステータスカード */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          <div className="bg-slate-700/50 p-3 rounded-2xl text-center border border-slate-600 shadow-inner">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Streak</p>
            <p className="text-xl font-black text-orange-400">{stats.streak}<span className="text-xs ml-0.5 font-bold">日</span></p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-2xl text-center border border-slate-600 shadow-inner">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Best</p>
            <p className="text-xl font-black text-green-400">{stats.longestStreak}<span className="text-xs ml-0.5 font-bold">日</span></p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded-2xl text-center border border-slate-600 shadow-inner">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Price</p>
            <p className="text-lg font-black text-blue-400">¥{tierInfo.price}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 w-full box-border">
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase tracking-widest">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full box-border bg-slate-700 border-2 border-slate-600 rounded-2xl p-4 font-bold text-white outline-none focus:border-emerald-500 transition-all appearance-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              type="button"
              onClick={() => setStretchDone((v) => !v)}
              className={`w-full box-border rounded-3xl p-6 text-center font-black transition-all border-4 active:scale-95 ${
                stretchDone
                  ? "bg-emerald-600 border-emerald-400 text-white"
                  : "bg-slate-700 border-slate-600 text-slate-400"
              }`}
            >
              <div className="text-4xl mb-2">🧘</div>
              <div className="text-sm uppercase tracking-tighter">ストレッチ</div>
            </button>
            <button
              type="button"
              onClick={() => setPracticeDone((v) => !v)}
              className={`w-full box-border rounded-3xl p-6 text-center font-black transition-all border-4 active:scale-95 ${
                practiceDone
                  ? "bg-emerald-600 border-emerald-400 text-white"
                  : "bg-slate-700 border-slate-600 text-slate-400"
              }`}
            >
              <div className="text-4xl mb-2">⚽️</div>
              <div className="text-sm uppercase tracking-tighter">自主練</div>
            </button>
          </div>

          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-500 mb-1 ml-1 uppercase tracking-widest">Memo</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full box-border bg-slate-700 border-2 border-slate-600 rounded-2xl p-4 text-white focus:border-emerald-500 outline-none resize-none text-sm"
              placeholder="気づいたこと（例：股関節を中心にストレッチした）"
              rows={2}
            />
          </div>

          {/* 未精算のおこづかい */}
          <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700 w-full box-border relative">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-tight">未精算のおこづかい</span>
              <span className="text-3xl font-black text-white italic text-right">
                <small className="text-sm mr-1 text-green-500 not-italic">¥</small>
                {stats.unpaidMoney.toLocaleString()}
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold text-right mt-1 uppercase tracking-tight italic">
              ※今回の獲得予定: +¥{previewMoney}
            </p>
          </div>

          <button
            disabled={loading}
            className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-600 text-slate-900 rounded-2xl font-black text-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all uppercase italic tracking-tighter"
          >
            {loading ? "Recording..." : "きろくする"}
          </button>
        </form>

        <div className="mt-8 text-center flex justify-between items-center px-2">
          <Link href="/training/history" className="text-slate-500 font-bold hover:text-emerald-500 text-[10px] transition-colors tracking-widest uppercase">
            History →
          </Link>
          <Link href="/training/admin" className="text-slate-700 font-bold hover:text-yellow-600 text-[10px] transition-colors tracking-widest uppercase">
            Admin (清算)
          </Link>
        </div>
      </div>
    </div>
  );
}
