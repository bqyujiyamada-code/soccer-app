"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MatchEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 入力データ一式
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    matchType: "公式戦",
    tournamentName: "",
    matchStep: "",
    opponent: "",
    scoreUs: "",
    scoreThem: "",
    hasPK: false, // PKがあったかどうかのスイッチ
    pkScoreUs: "",
    pkScoreThem: "",
    myGoals: "0",
    myAssists: "0",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/save-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("試合結果を記録しました！⚽️");
        router.push("/match/history"); // まだ作っていませんが、次は履歴画面へ！
      }
    } catch (err) {
      alert("エラーがおきました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-12">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-t-8 border-blue-600">
        <div className="p-6">
          <h1 className="text-2xl font-black text-center text-slate-800 mb-6 flex items-center justify-center gap-2">
            🏆 試合結果の入力
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 基本情報 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">日付</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-3 bg-slate-100 rounded-xl font-bold text-sm outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">試合種別</label>
                <select name="matchType" value={formData.matchType} onChange={handleChange} className="w-full p-3 bg-slate-100 rounded-xl font-bold text-sm outline-none">
                  <option>公式戦</option>
                  <option>トレーニングマッチ</option>
                  <option>カップ戦</option>
                  <option>その他</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">大会名 / ステップ（予選など）</label>
              <div className="flex gap-2">
                <input type="text" name="tournamentName" placeholder="大会名" value={formData.tournamentName} onChange={handleChange} className="flex-[2] p-3 bg-slate-100 rounded-xl text-sm outline-none" required />
                <input type="text" name="matchStep" placeholder="予選等" value={formData.matchStep} onChange={handleChange} className="flex-[1] p-3 bg-slate-100 rounded-xl text-sm outline-none" />
              </div>
            </div>

            {/* 対戦相手とスコア */}
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <label className="block text-xs font-bold text-blue-600 mb-2 text-center underline">対戦相手</label>
              <input type="text" name="opponent" placeholder="相手チーム名" value={formData.opponent} onChange={handleChange} className="w-full p-3 mb-4 rounded-xl text-center font-bold outline-none border-2 border-transparent focus:border-blue-400" required />
              
              <div className="flex items-center justify-around gap-2">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 mb-1">自分たち</p>
                  <input type="number" name="scoreUs" value={formData.scoreUs} onChange={handleChange} className="w-16 h-16 text-3xl font-black text-center rounded-2xl border-2 border-blue-200 outline-none focus:border-blue-500" placeholder="0" required />
                </div>
                <div className="text-2xl font-black text-slate-300 self-end mb-4">-</div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-slate-400 mb-1">相手</p>
                  <input type="number" name="scoreThem" value={formData.scoreThem} onChange={handleChange} className="w-16 h-16 text-3xl font-black text-center rounded-2xl border-2 border-blue-200 outline-none focus:border-blue-500" placeholder="0" required />
                </div>
              </div>

              {/* PK戦スイッチ */}
              <div className="mt-6 pt-4 border-t border-blue-200 flex flex-col items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="hasPK" checked={formData.hasPK} onChange={handleChange} className="w-5 h-5 accent-blue-600" />
                  <span className="text-sm font-bold text-blue-700">PK戦になった</span>
                </label>

                {/* PKスコア（チェックした時だけ表示） */}
                {formData.hasPK && (
                  <div className="mt-3 flex items-center gap-3 animate-in fade-in zoom-in duration-200">
                    <input type="number" name="pkScoreUs" value={formData.pkScoreUs} onChange={handleChange} className="w-12 p-2 text-center rounded-lg border border-blue-300 font-bold" placeholder="PK" />
                    <span className="font-bold text-blue-400">PK</span>
                    <input type="number" name="pkScoreThem" value={formData.pkScoreThem} onChange={handleChange} className="w-12 p-2 text-center rounded-lg border border-blue-300 font-bold" placeholder="PK" />
                  </div>
                )}
              </div>
            </div>

            {/* 個人の成績 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100">
                <label className="block text-[10px] font-black text-orange-600 mb-1 uppercase">My Goal ⚽️</label>
                <input type="number" name="myGoals" value={formData.myGoals} onChange={handleChange} className="w-full bg-transparent text-2xl font-black text-orange-700 outline-none" />
              </div>
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                <label className="block text-[10px] font-black text-emerald-600 mb-1 uppercase">My Assist 👟</label>
                <input type="number" name="myAssists" value={formData.myAssists} onChange={handleChange} className="w-full bg-transparent text-2xl font-black text-emerald-700 outline-none" />
              </div>
            </div>

            <button disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-all">
              {loading ? "保存中..." : "試合をきろくする"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/lifting/history" className="text-sm font-bold text-slate-400">
              ← リフティング履歴へ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
