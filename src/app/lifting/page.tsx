"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // 画面遷移のための機能を追加
import Link from "next/link";

export default function LiftingEntry() {
  const router = useRouter(); // routerを使えるように準備
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [count, setCount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/save-lifting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, count, memo }),
      });

      if (res.ok) {
        // 1. まずはお祝いのアラートを出す
        alert("ナイスリフティング！保存したよ！⚽️");
        
        // 2. その後、履歴画面へ移動する
        router.push("/lifting/history");
      } else {
        throw new Error();
      }
    } catch (err) {
      alert("ごめん！エラーがおきちゃった。もう一度試してみてね。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 p-4 flex items-center justify-center overflow-x-hidden">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 border-4 border-green-500 box-border flex flex-col">
        
        <h1 className="text-2xl font-black text-center text-green-700 mb-8 px-2">
          ⚽️ リフティング記録 ⚽️
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 flex flex-col w-full">
          
          <div className="flex flex-col w-full">
            <label className="block font-bold text-gray-700 mb-1 ml-1">いつやった？</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              className="w-full appearance-none box-border p-4 border-2 border-gray-200 rounded-xl font-bold text-base outline-none focus:border-green-400 bg-white"
            />
          </div>

          <div className="flex flex-col w-full">
            <label className="block font-bold text-gray-700 mb-1 ml-1">さいこう何回？</label>
            <div className="relative w-full">
              <input 
                type="number" 
                inputMode="numeric"
                placeholder="0"
                value={count} 
                onChange={(e) => setCount(e.target.value)} 
                className="w-full box-border p-6 border-2 border-green-200 rounded-xl text-5xl text-center font-black text-green-600 outline-none focus:border-green-500 bg-green-50/30" 
                required 
              />
              <span className="absolute right-4 bottom-4 text-green-700 font-bold">回</span>
            </div>
          </div>

          <div className="flex flex-col w-full">
            <label className="block font-bold text-gray-700 mb-1 ml-1">ひとことメモ</label>
            <textarea 
              value={memo} 
              onChange={(e) => setMemo(e.target.value)} 
              className="w-full box-border p-4 border-2 border-gray-200 rounded-xl text-base focus:border-green-400 outline-none" 
              placeholder="今日の調子はどうだった？"
              rows={3}
            />
          </div>

          <button 
            disabled={loading} 
            className="w-full py-5 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-2xl font-black text-2xl shadow-lg active:scale-95 transition-all"
          >
            {loading ? "保存中..." : "きろくする！"}
          </button>
        </form>

        <div className="mt-8 text-center">
           <Link href="/lifting/history" className="text-gray-400 font-bold hover:text-green-600">
             🗓️ 履歴（りれき）をみる
           </Link>
        </div>
      </div>
    </div>
  );
}
